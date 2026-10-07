@extends('layouts.admin')

@section('title')
    Server Leaderboard
@endsection

@section('content-header')
    <h1>Leaderboard<small>Which servers and owners have actually been running the longest.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        <li class="active">Leaderboard</li>
    </ol>
@endsection

@section('content')
@include('partials.admin.servers.tabs')

@php
    /**
     * Format a duration for a human. Deliberately shows days as the headline
     * unit: this is a long-horizon ranking, and "34d" reads faster than
     * "817 hours". The exact h/m is kept beside it so nobody has to guess.
     */
    $human = function (int $seconds): array {
        return [
            'd' => intdiv($seconds, 86400),
            'h' => intdiv($seconds % 86400, 3600),
            'm' => intdiv($seconds % 3600, 60),
        ];
    };

    $sampledHours = $totals['sampled'] / 3600;
    $totalHours = ($totals['sampled'] + $totals['backfilled']) / 3600;
    $estimatedLabel = $totals['estimated'] === 1 ? 'server' : 'servers';

    /**
     * The honesty rule for this page: do not describe the numbers as "measured"
     * when the sampler has not had time to measure anything yet. On a fresh
     * install every hour is reconstructed, and saying otherwise would be a lie
     * the reader can see through in one glance at the cards.
     */
    $fullyMeasured = $totals['sampled'] > 0 && $totals['backfilled'] === 0;
    $mostlyReconstructed = $totals['backfilled'] > 0 && $sampledHours < $totalHours * 0.05;

    /**
     * A badge only earns its place if it separates rows. Right now every server
     * is estimated, so a per-row badge would be noise on every line and mean
     * nothing. The banner already says the whole board is reconstructed, so the
     * badge is shown only once the board is mixed — measured rows and estimated
     * rows side by side, which is when the distinction actually informs.
     */
    $estimatedServerCount = collect($topServers)->where('estimated', true)->count();
    $showServerBadges = $estimatedServerCount > 0 && $estimatedServerCount < count($topServers);
    $estimatedUserCount = collect($topUsers)->where('estimated', true)->count();
    $showUserBadges = $estimatedUserCount > 0 && $estimatedUserCount < count($topUsers);
@endphp

<div class="row">
    <div class="col-xs-12">
        <div class="callout callout-{{ $mostlyReconstructed ? 'warning' : 'info' }} callout-slim">
            <p>
                @if ($fullyMeasured)
                    Runtime here is <strong>measured</strong>: the panel samples each server every minute
                    and accumulates the time it is actually up.
                @elseif ($mostlyReconstructed)
                    Most of the runtime below is <strong>reconstructed</strong>, not yet measured. The panel
                    has only just started sampling every minute, so today's figures were rebuilt from the
                    activity log for <strong>{{ $totals['estimated'] }}</strong>
                    {{ $estimatedLabel }}@if ($showServerBadges || $showUserBadges), marked
                    <span class="label label-warning">est</span>@endif. From here on, new runtime is measured
                    directly, and the badge will then distinguish the measured rows from the estimated ones.
                @else
                    Runtime here is <strong>measured</strong>: the panel samples each server every minute and
                    accumulates the time it is actually up. History before this feature existed was
                    reconstructed from the activity log for <strong>{{ $totals['estimated'] }}</strong>
                    {{ $estimatedLabel }}@if ($showServerBadges || $showUserBadges) and is marked
                    <span class="label label-warning">est</span>@endif.
                @endif
            </p>
        </div>
    </div>
</div>

{{-- Headline totals: give the reader the scale of the sample before the ranking. --}}
<div class="row">
    <div class="col-sm-4 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-aqua"><i class="fa fa-clock-o"></i></span>
            <div class="info-box-content">
                <span class="info-box-text">Total runtime recorded</span>
                <span class="info-box-number">{{ number_format($totalHours, 1) }} <small>hours</small></span>
            </div>
        </div>
    </div>
    <div class="col-sm-4 col-xs-12">
        <div class="info-box">
            {{-- Green here means "directly measured", not "healthy": the three tiles
                 colour-code the DATA SOURCE (measured vs reconstructed), which is the
                 distinction this page is about. A neutral grey tile was tried first and
                 looked like an unstyled placeholder next to the two saturated plates —
                 and because --nx-ink-2 flips, it became a pale slab in dark mode. The
                 plate token is constant, so the white glyph holds in both themes. --}}
            <span class="info-box-icon bg-green"><i class="fa fa-heartbeat"></i></span>
            <div class="info-box-content">
                <span class="info-box-text">Measured by sampler</span>
                <span class="info-box-number">{{ number_format($sampledHours, 1) }} <small>hours</small></span>
            </div>
        </div>
    </div>
    <div class="col-sm-4 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-yellow"><i class="fa fa-history"></i></span>
            <div class="info-box-content">
                <span class="info-box-text">Reconstructed from log</span>
                <span class="info-box-number">{{ number_format($totals['backfilled'] / 3600, 1) }} <small>hours</small></span>
            </div>
        </div>
    </div>
</div>

<div class="row">
    {{-- ------------------------------------------------------------------ servers --}}
    <div class="col-md-6 col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Top Servers by Runtime</h3>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th style="width:3rem;">#</th>
                            <th>Server</th>
                            <th>Owner</th>
                            <th class="text-right">Runtime</th>
                        </tr>
                        @forelse ($topServers as $i => $row)
                            <tr>
                                <td class="text-muted">{{ $i + 1 }}</td>
                                <td>
                                    <a href="{{ route('admin.servers.view', $row['server']->id) }}">{{ $row['server']->name }}</a>
                                    @if ($showServerBadges && $row['estimated'])
                                        <span class="label label-warning" title="Includes history reconstructed from the activity log">est</span>
                                    @endif
                                    <div class="text-muted"><small>{{ $row['server']->node->name ?? '—' }}</small></div>
                                </td>
                                <td>
                                    @if ($row['server']->user)
                                        <a href="{{ route('admin.users.view', $row['server']->user->id) }}">{{ $row['server']->user->username }}</a>
                                    @else
                                        <span class="text-muted">—</span>
                                    @endif
                                </td>
                                @php $t = $human($row['seconds']); @endphp
                                <td class="text-right">
                                    <strong>{{ $t['d'] }}<small>d</small> {{ sprintf('%02d', $t['h']) }}<small>h</small> {{ sprintf('%02d', $t['m']) }}<small>m</small></strong>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted">No runtime recorded yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="box-footer">
                <small class="text-muted">
                    Servers with no recorded runtime are not listed, so this may show fewer rows
                    than the total number of servers.
                </small>
            </div>
        </div>
    </div>

    {{-- -------------------------------------------------------------------- users --}}
    <div class="col-md-6 col-xs-12">
        <div class="box box-success">
            <div class="box-header with-border">
                <h3 class="box-title">Top Users by Combined Runtime</h3>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th style="width:3rem;">#</th>
                            <th>User</th>
                            <th class="text-center">Servers</th>
                            <th class="text-right">Total Runtime</th>
                        </tr>
                        @forelse ($topUsers as $i => $row)
                            <tr>
                                <td class="text-muted">{{ $i + 1 }}</td>
                                <td>
                                    <a href="{{ route('admin.users.view', $row['user']->id) }}">
                                        {{ $row['user']->username ?: $row['user']->email }}
                                    </a>
                                    @if ($showUserBadges && $row['estimated'])
                                        <span class="label label-warning" title="At least one of this user's servers includes reconstructed history">est</span>
                                    @endif
                                    @if ($row['user']->name_first || $row['user']->name_last)
                                        <div class="text-muted"><small>{{ trim($row['user']->name_first . ' ' . $row['user']->name_last) }}</small></div>
                                    @endif
                                </td>
                                <td class="text-center text-muted">{{ $row['server_count'] }}</td>
                                @php $t = $human($row['seconds']); @endphp
                                <td class="text-right">
                                    <strong>{{ $t['d'] }}<small>d</small> {{ sprintf('%02d', $t['h']) }}<small>h</small> {{ sprintf('%02d', $t['m']) }}<small>m</small></strong>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted">No runtime recorded yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="box-footer">
                <small class="text-muted">
                    A user's total is the sum of runtime across every server they own, including
                    servers they no longer have access to. Ranks users who actually keep servers up,
                    not users who own the most servers.
                </small>
            </div>
        </div>
    </div>
</div>
@endsection
