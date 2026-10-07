<?php

namespace Pterodactyl\Http\Controllers\Admin\Servers;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Models\ServerRuntimeTotal;
use Pterodactyl\Http\Controllers\Controller;

/**
 * Runtime leaderboard.
 *
 * Ranks servers and server owners by total measured runtime. The numbers come
 * from server_runtime_totals, which is fed by a per-minute sampler and a
 * one-time reconstruction from the activity log — see the two console commands
 * for why Pterodactyl cannot answer this question on its own.
 */
class ServerLeaderboardController extends Controller
{
    /**
     * How many rows each ranking shows. A leaderboard is a glance, not a report;
     * the full server list is one click away.
     */
    public const LIMIT = 10;

    public function index(Request $request): View
    {
        return view('admin.servers.leaderboard', [
            'topServers' => $this->topServers(),
            'topUsers' => $this->topUsers(),
            'totals' => $this->systemTotals(),
        ]);
    }

    /**
     * Servers with the most accumulated runtime.
     *
     * Servers are hard-deleted in this codebase (no soft-delete column), and the
     * runtime row cascades away with the server, so there is no trashed state to
     * account for here.
     *
     * Zero-runtime servers are excluded: a ranking of "longest running" should
     * not pad itself with rows that have never run. They still exist in the
     * server list, which is the right place to see them.
     */
    private function topServers(): array
    {
        return ServerRuntimeTotal::query()
            ->with(['server' => fn ($q) => $q->with('node', 'user')])
            ->whereHas('server')
            ->whereRaw('(sampled_seconds + backfilled_seconds) > 0')
            ->orderByRaw('(sampled_seconds + backfilled_seconds) DESC')
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (ServerRuntimeTotal $row) => [
                'server' => $row->server,
                'seconds' => $row->total_seconds,
                'estimated' => $row->is_estimated,
            ])
            ->all();
    }

    /**
     * Owners ranked by the combined runtime of every server they hold.
     *
     * Aggregated in SQL rather than in PHP so the ranking stays correct if the
     * limit ever grows past the point where loading every row is reasonable.
     */
    private function topUsers(): array
    {
        $rows = DB::table('server_runtime_totals as rt')
            ->join('servers as s', 's.id', '=', 'rt.server_id')
            ->join('users as u', 'u.id', '=', 's.owner_id')
            ->selectRaw('u.id, u.username, u.email, u.name_first, u.name_last')
            ->selectRaw('SUM(rt.sampled_seconds + rt.backfilled_seconds) as total_seconds')
            ->selectRaw('COUNT(s.id) as server_count')
            ->selectRaw('SUM(CASE WHEN rt.backfilled_at IS NOT NULL THEN 1 ELSE 0 END) as estimated_count')
            ->groupBy('u.id', 'u.username', 'u.email', 'u.name_first', 'u.name_last')
            ->orderByDesc('total_seconds')
            ->limit(self::LIMIT)
            ->get();

        return $rows
            ->filter(fn ($row) => (int) $row->total_seconds > 0)
            ->values()
            ->map(fn ($row) => [
                'user' => $row,
                'seconds' => (int) $row->total_seconds,
                'server_count' => (int) $row->server_count,
                'estimated' => (int) $row->estimated_count > 0,
            ])
            ->all();
    }

    /**
     * Headline figures for the page. Reported alongside the rankings so the
     * reader can judge how much of the history is reconstructed.
     */
    private function systemTotals(): array
    {
        $row = DB::table('server_runtime_totals')
            ->selectRaw('COALESCE(SUM(sampled_seconds), 0) as sampled')
            ->selectRaw('COALESCE(SUM(backfilled_seconds), 0) as backfilled')
            ->selectRaw('COUNT(*) as tracked')
            ->selectRaw('SUM(CASE WHEN backfilled_at IS NOT NULL THEN 1 ELSE 0 END) as estimated')
            ->first();

        return [
            'sampled' => (int) ($row->sampled ?? 0),
            'backfilled' => (int) ($row->backfilled ?? 0),
            'tracked' => (int) ($row->tracked ?? 0),
            'estimated' => (int) ($row->estimated ?? 0),
        ];
    }
}
