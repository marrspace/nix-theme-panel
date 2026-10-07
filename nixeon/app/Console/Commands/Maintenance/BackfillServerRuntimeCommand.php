<?php

namespace Pterodactyl\Console\Commands\Maintenance;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Pterodactyl\Models\ActivityLog;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerRuntimeTotal;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

/**
 * Reconstructs historical runtime from the activity log, once.
 *
 * Pterodactyl never stored uptime, but it does log every power action, so the
 * past can be rebuilt. This was validated against the daemons before being
 * written: a naive "pair each start with the next stop" is WRONG, because a
 * server that dies with the node (or crashes) never writes a stop row and its
 * session appears to run forever. Measured on this panel, that bug credited one
 * dead server 404 hours — 100% of its total.
 *
 * The rules below are what make the reconstruction defensible:
 *
 *   start / restart  -> the server is up
 *   stop / kill      -> the server is down
 *   a start while already up, or a stop while already down, is a duplicate and
 *     is ignored (this panel has 72 such duplicate starts on one server)
 *   restart while up keeps the SAME interval running — a restart is not downtime
 *
 * An interval that is still open at the end of the log is the dangerous case, so
 * it is resolved against reality rather than assumed:
 *
 *   daemon says running  -> credit up to now (the server really is up)
 *   daemon says offline  -> credit only up to the last activity that server ever
 *                           logged, because that is the last moment we can prove
 *                           it was alive. No activity after the start means no
 *                           provable runtime, so it credits zero.
 *
 * The bias is deliberate and one-directional: never invent time that cannot be
 * shown to have happened. Every figure produced here is marked estimated.
 */
class BackfillServerRuntimeCommand extends Command
{
    protected $signature = 'p:runtime:backfill
                            {--force : Re-run even for servers that already have a backfilled figure}';

    protected $description = 'Reconstruct historical server runtime from the activity log (one-time, estimated).';

    public function handle(DaemonServerRepository $repository): int
    {
        $now = CarbonImmutable::now();

        $servers = Server::query()->get();

        $this->info('Reconstructing runtime from activity_logs (estimated figures)…');
        $this->newLine();

        $rows = [];

        foreach ($servers as $server) {
            $total = ServerRuntimeTotal::firstOrNew(['server_id' => $server->id]);

            if ($total->exists && $total->backfilled_at !== null && !$this->option('force')) {
                $this->line(sprintf('  %-24s already backfilled, skipping (use --force to redo)', mb_substr($server->name, 0, 24)));
                continue;
            }

            $result = $this->reconstruct($server, $repository, $now);

            // Re-baseline sampling: history is now represented by the backfill, so
            // any sampled seconds predating it would double-count the same minutes.
            $total->sampled_seconds = 0;
            $total->backfilled_seconds = $result['seconds'];
            $total->backfilled_at = $now;
            $total->save();

            $rows[] = [
                mb_substr($server->name, 0, 24),
                $this->human($result['seconds']),
                $result['sessions'],
                $result['open'] ? 'open→' . $result['openResolution'] : '-',
            ];
        }

        $this->newLine();
        $this->table(['server', 'estimated runtime', 'sessions', 'open session'], $rows);

        $this->newLine();
        $this->info(sprintf('Done. %d server(s) processed.', count($rows)));
        $this->comment('These figures are estimates reconstructed from power events, not measured runtime.');

        return self::SUCCESS;
    }

    /**
     * Walk one server's power timeline and return the reconstructed total.
     *
     * @return array{seconds: int, sessions: int, open: bool, openResolution: string}
     */
    private function reconstruct(Server $server, DaemonServerRepository $repository, CarbonImmutable $now): array
    {
        $events = $this->powerEvents($server);

        $running = false;
        $startedAt = null;
        $total = 0;
        $sessions = 0;
        $open = false;

        foreach ($events as $event) {
            $at = $event['at'];

            switch ($event['event']) {
                case 'server:power.start':
                    if (!$running) {
                        $running = true;
                        $startedAt = $at;
                        $sessions++;
                    }
                    break;

                case 'server:power.restart':
                    if (!$running) {
                        // A restart from a stopped state still means it came up.
                        $running = true;
                        $startedAt = $at;
                        $sessions++;
                    }
                    // While running, a restart does not break the interval: the
                    // server was up before and after, so the time still counts.
                    break;

                case 'server:power.stop':
                case 'server:power.kill':
                    if ($running) {
                        // Carbon 3: earlier -> later yields a positive duration.
                        $total += $startedAt->diffInSeconds($at);
                        $running = false;
                        $startedAt = null;
                    }
                    break;
            }
        }

        $resolution = '-';

        if ($running) {
            $open = true;

            $liveState = $this->probeState($server, $repository);
            $uptimeSeconds = $this->probeUptime($server, $repository);

            if ($liveState !== null && in_array($liveState, SampleServerRuntimeCommand::RUNNING_STATES, true)) {
                // Genuinely up. Trust the daemon's own counter for the current
                // session when it is available — it knows about restarts the log
                // never saw; otherwise fall back to the elapsed wall time.
                $elapsed = $startedAt->diffInSeconds($now);
                $current = $uptimeSeconds !== null
                    ? min($uptimeSeconds, $elapsed)
                    : $elapsed;

                $total += max(0, $current);
                $resolution = sprintf('running (%s)', $this->human($current));
            } else {
                // Offline (or unreachable): the session ended without a stop row.
                // Credit only up to the last activity this server ever logged.
                $lastActivity = $this->lastActivityAt($server);

                if ($lastActivity !== null && $lastActivity->greaterThan($startedAt)) {
                    $credit = $startedAt->diffInSeconds($lastActivity);
                    $total += $credit;
                    $resolution = sprintf('offline, capped at last activity (%s)', $this->human($credit));
                } else {
                    // Nothing proves it was ever really up. Credit nothing.
                    $resolution = 'offline, no proof of life (0)';
                }
            }
        }

        return [
            'seconds' => (int) $total,
            'sessions' => $sessions,
            'open' => $open,
            'openResolution' => $resolution,
        ];
    }

    /**
     * Power events for a server, oldest first.
     *
     * The subject table keys on the numeric server id (not the uuid), and the
     * properties column is empty on this panel — the subject row is the only
     * thing that says which server an event belongs to.
     *
     * @return array<int, array{event: string, at: CarbonImmutable}>
     */
    private function powerEvents(Server $server): array
    {
        $logs = ActivityLog::query()
            ->select(['activity_logs.event', 'activity_logs.timestamp'])
            ->join('activity_log_subjects as sub', function ($join) {
                $join->on('sub.activity_log_id', '=', 'activity_logs.id')
                    ->where('sub.subject_type', '=', 'server');
            })
            ->where('sub.subject_id', $server->id)
            ->whereIn('activity_logs.event', [
                'server:power.start',
                'server:power.stop',
                'server:power.restart',
                'server:power.kill',
            ])
            ->orderBy('activity_logs.timestamp')
            ->orderBy('activity_logs.id')
            ->get();

        return $logs->map(fn ($row) => [
            'event' => $row->event,
            'at' => CarbonImmutable::parse($row->timestamp),
        ])->all();
    }

    /**
     * The most recent activity of any kind for this server — the last moment it
     * can be shown to have been alive.
     */
    private function lastActivityAt(Server $server): ?CarbonImmutable
    {
        $row = ActivityLog::query()
            ->select(['activity_logs.timestamp'])
            ->join('activity_log_subjects as sub', function ($join) {
                $join->on('sub.activity_log_id', '=', 'activity_logs.id')
                    ->where('sub.subject_type', '=', 'server');
            })
            ->where('sub.subject_id', $server->id)
            ->orderByDesc('activity_logs.timestamp')
            ->first();

        return $row ? CarbonImmutable::parse($row->timestamp) : null;
    }

    private function probeState(Server $server, DaemonServerRepository $repository): ?string
    {
        try {
            return $repository->setServer($server)->getDetails()['state'] ?? null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function probeUptime(Server $server, DaemonServerRepository $repository): ?int
    {
        try {
            $details = $repository->setServer($server)->getDetails();
            $ms = $details['utilization']['uptime'] ?? null;

            return $ms === null ? null : (int) intdiv((int) $ms, 1000);
        } catch (\Throwable) {
            return null;
        }
    }

    private function human(int $seconds): string
    {
        $d = intdiv($seconds, 86400);
        $h = intdiv($seconds % 86400, 3600);
        $m = intdiv($seconds % 3600, 60);

        return sprintf('%dd %02dh %02dm', $d, $h, $m);
    }
}
