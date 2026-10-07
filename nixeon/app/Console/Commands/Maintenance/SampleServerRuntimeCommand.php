<?php

namespace Pterodactyl\Console\Commands\Maintenance;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerRuntimeTotal;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

/**
 * Samples every server's live state from Wings and credits the elapsed time to
 * those that are actually running.
 *
 * Why sampling and not "uptime from the daemon": Wings reports the uptime of the
 * CURRENT container only, and this panel has a server that has restarted 225
 * times — its live uptime is nearly always minutes, which would rank it last
 * instead of first. Sampling accumulates across restarts, so "most active" means
 * what a human means by it.
 *
 * Correctness rules, each learned from real data in this panel:
 *
 *  - Credit is the elapsed wall time between the previous sample and now, NOT
 *    the daemon's uptime. Uptime resets on restart and would double-count.
 *  - The delta is capped (MAX_CREDIT_SECONDS). If the scheduler or the daemon was
 *    down for a day, an uncapped delta would credit a whole day in one tick for a
 *    server that may have died halfway through. Under-reporting is honest;
 *    over-reporting is not.
 *  - A server that is unreachable contributes nothing and does not advance its
 *    baseline, so a transient daemon outage cannot manufacture runtime.
 */
class SampleServerRuntimeCommand extends Command
{
    /**
     * Never credit more than this in a single tick. Two minutes gives the
     * once-a-minute schedule headroom for a slow tick without ever letting a
     * long outage inflate the total.
     */
    public const MAX_CREDIT_SECONDS = 120;

    /**
     * States Wings reports that mean "this server is using CPU right now".
     */
    public const RUNNING_STATES = ['running', 'starting'];

    protected $signature = 'p:runtime:sample';

    protected $description = 'Sample live server state and accumulate total runtime for the leaderboard.';

    public function handle(DaemonServerRepository $repository): int
    {
        $now = CarbonImmutable::now();

        $servers = Server::query()->with('node')->get();

        $credited = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($servers as $server) {
            $state = $this->probeState($server, $repository);

            if ($state === null) {
                // Unreachable: leave the baseline untouched so the outage cannot
                // later be credited as runtime.
                $failed++;
                continue;
            }

            $total = ServerRuntimeTotal::firstOrNew(['server_id' => $server->id]);
            $previous = $total->last_sampled_at;

            if (in_array($state, self::RUNNING_STATES, true)) {
                if ($previous !== null) {
                    // Carbon 3 diffs are SIGNED: earlier -> later is positive, so
                    // the earlier timestamp must be the receiver.
                    $delta = $previous->diffInSeconds($now);
                    if ($delta > 0) {
                        $total->sampled_seconds += min($delta, self::MAX_CREDIT_SECONDS);
                        $credited++;
                    }
                }
            } else {
                $skipped++;
            }

            $total->last_sampled_at = $now;
            $total->last_state = $state;
            $total->save();
        }

        $this->info(sprintf(
            'runtime sample: %d credited, %d idle, %d unreachable',
            $credited,
            $skipped,
            $failed
        ));

        return self::SUCCESS;
    }

    /**
     * Ask Wings for the live state. Returns null when the daemon cannot be
     * reached, which the caller treats as "do not credit".
     */
    private function probeState(Server $server, DaemonServerRepository $repository): ?string
    {
        try {
            $details = $repository->setServer($server)->getDetails();

            return $details['state'] ?? null;
        } catch (\Throwable $exception) {
            $this->warn(sprintf('  %s: %s', $server->name, mb_substr($exception->getMessage(), 0, 90)));

            return null;
        }
    }
}
