{{--
    Shared tab strip for the Servers admin area. Kept as a partial so the list and
    the leaderboard can never drift apart, and so adding a third view later is a
    one-line change in two files rather than a copy-paste of the markup.
--}}
@section('servers::tabs')
    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom nav-tabs-floating">
                <ul class="nav nav-tabs">
                    <li @if(request()->routeIs('admin.servers')) class="active" @endif>
                        <a href="{{ route('admin.servers') }}">Server List</a>
                    </li>
                    <li @if(request()->routeIs('admin.servers.leaderboard')) class="active" @endif>
                        <a href="{{ route('admin.servers.leaderboard') }}">Leaderboard</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
@endsection
@yield('servers::tabs')
