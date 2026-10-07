#!/usr/bin/env bash
#
#  ███╗   ██╗██╗██╗  ██╗███████╗ ██████╗ ███╗   ██╗    ██╗  ██╗ ██████╗  █████╗
#  ████╗  ██║██║╚██╗██╔╝██╔════╝██╔═══██╗████╗  ██║    ██║  ██║██╔═██╗ ██╔══██╗
#  ██╔██╗ ██║██║ ╚███╔╝ █████╗  ██║   ██║██╔██╗ ██║    ███████║██████╔╝╚█████╔╝
#  ██║╚██╗██║██║ ██╔██╗ ██╔══╝  ██║   ██║██║╚██╗██║    ╚════██║██╔══██╗██╔══██╗
#  ██║ ╚████║██║██╔╝ ██╗███████╗╚██████╔╝██║ ╚████║         ██║██║  ██║╚█████╔╝
#  ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝         ╚═╝╚═╝  ╚═╝ ╚════╝
#
#  Nixeon 408 — a full re-skin for Pterodactyl Panel (front-end + admin).
#
#  Installs: the theme (React front-end + AdminLTE admin), the prebuilt asset
#  bundle, and the Runtime Leaderboard feature.
#
#  Tested against Pterodactyl 1.15.1 on Ubuntu 20.04 / 22.04 / 24.04.
#
#  Usage:   bash install.sh
#  Re-run:  safe — it re-applies and takes a fresh backup each time.
#
set -uo pipefail

# ---------------------------------------------------------------------------
# presentation
# ---------------------------------------------------------------------------
if [[ -t 1 ]]; then
    B=$'\033[1m'; DIM=$'\033[2m'; R=$'\033[0m'
    RED=$'\033[38;5;203m'; GRN=$'\033[38;5;114m'; YEL=$'\033[38;5;179m'
    BLU=$'\033[38;5;111m'; CYN=$'\033[38;5;116m'
else
    B=''; DIM=''; R=''; RED=''; GRN=''; YEL=''; BLU=''; CYN=''
fi

step()  { printf '\n%s▸ %s%s\n' "$B$BLU" "$1" "$R"; }
ok()    { printf '  %s✓%s %s\n' "$GRN" "$R" "$1"; }
warn()  { printf '  %s!%s %s\n' "$YEL" "$R" "$1"; }
fail()  { printf '  %s✗%s %s\n' "$RED" "$R" "$1"; }
info()  { printf '  %s·%s %s\n' "$DIM" "$R" "$1"; }
die()   { printf '\n%s✗ %s%s\n\n' "$RED$B" "$1" "$R"; exit 1; }

banner() {
    printf '\n%s' "$CYN"
    cat <<'ART'
   ┌─────────────────────────────────────────────┐
   │                                             │
   │     N I X E O N   4 0 8                     │
   │     Pterodactyl Panel Theme                 │
   │                                             │
   └─────────────────────────────────────────────┘
ART
    printf '%s\n' "$R"
}

# ---------------------------------------------------------------------------
# where am I, and do I have the payload?
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAYLOAD="$SCRIPT_DIR/nixeon"

banner

[[ -d "$PAYLOAD" ]] || die "payload directory not found at $PAYLOAD — run this script from the repository root."
[[ -f "$PAYLOAD/resources/scripts/assets/css/tokens.css" ]] || die "payload looks incomplete (tokens.css missing)."

# ---------------------------------------------------------------------------
# 1. privileges
# ---------------------------------------------------------------------------
step "Checking privileges"

if [[ "$(id -u)" -ne 0 ]]; then
    die "This installer must run as root.  Try:  sudo bash install.sh"
fi
ok "running as root"

# ---------------------------------------------------------------------------
# 2. locate the panel
# ---------------------------------------------------------------------------
step "Locating the Pterodactyl installation"

# NIXEON_PANEL lets you point at a specific install (custom path, or a sandbox
# when testing). Without it, the usual locations are tried in order.
PANEL="${NIXEON_PANEL:-}"
if [[ -n "$PANEL" ]]; then
    [[ -f "$PANEL/artisan" ]] || die "NIXEON_PANEL=$PANEL has no artisan file."
else
    for candidate in /var/www/pterodactyl /var/www/pterodactyl-panel /srv/pterodactyl; do
        if [[ -f "$candidate/artisan" && -f "$candidate/config/app.php" ]]; then
            PANEL="$candidate"
            break
        fi
    done
fi

if [[ -z "$PANEL" ]]; then
    printf '\n  Could not find the panel automatically.\n'
    printf '  Enter the full path to your Pterodactyl directory: '
    read -r PANEL
    [[ -f "$PANEL/artisan" ]] || die "no artisan file at $PANEL — that does not look like a Pterodactyl install."
fi
ok "panel found at $PANEL"

# ---------------------------------------------------------------------------
# 3. environment checks
# ---------------------------------------------------------------------------
step "Checking the environment"

PHP_BIN=""
for c in php8.3 php8.2 php; do
    if command -v "$c" >/dev/null 2>&1; then
        PHP_BIN="$c"
        break
    fi
done
[[ -n "$PHP_BIN" ]] || die "PHP not found in PATH."
PHP_VER="$("$PHP_BIN" -r 'echo PHP_VERSION;')"
ok "PHP $PHP_VER ($PHP_BIN)"

PANEL_VER="$("$PHP_BIN" -r '$c=include $argv[1]; echo $c["version"] ?? "unknown";' "$PANEL/config/app.php" 2>/dev/null)"
if [[ -n "$PANEL_VER" && "$PANEL_VER" != "unknown" ]]; then
    ok "Pterodactyl $PANEL_VER"
    case "$PANEL_VER" in
        1.1[0-9].*|1.[2-9][0-9].*) : ;;
        *) warn "this theme targets 1.15.x; $PANEL_VER may need manual review." ;;
    esac
fi

WEB_USER="www-data"
if ! id "$WEB_USER" >/dev/null 2>&1; then
    WEB_USER="$(stat -c '%U' "$PANEL/storage" 2>/dev/null || echo root)"
    warn "www-data not found, using $WEB_USER for file ownership"
fi

# ---------------------------------------------------------------------------
# 4. back up everything this installer will touch
# ---------------------------------------------------------------------------
step "Backing up the files that will be replaced"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SCRIPT_DIR/backups"
BACKUP="$BACKUP_DIR/pterodactyl-original-$STAMP.tar.gz"
mkdir -p "$BACKUP_DIR"

# only what we overwrite, so the archive stays small and the rollback precise
BACKUP_PATHS=(
    "resources/scripts"
    "resources/views/layouts/admin.blade.php"
    "resources/views/templates/wrapper.blade.php"
    "resources/views/admin/servers/index.blade.php"
    "public/assets"
    "public/themes"
    "routes/admin.php"
    "app/Console/Kernel.php"
    "app/Events/Auth/FailedCaptcha.php"
    "package.json"
    "yarn.lock"
    "tailwind.config.js"
)

existing=()
for rel in "${BACKUP_PATHS[@]}"; do
    [[ -e "$PANEL/$rel" ]] && existing+=("$rel")
done

# The build config files are installed by the theme but already exist on a stock
# Pterodactyl panel. They must be in the backup too, or a manual rollback cannot
# restore them and they would be left as the theme's version.
for extra in webpack.config.js babel.config.js tsconfig.json; do
    [[ -e "$PANEL/$extra" ]] && existing+=("$extra")
done

if [[ ${#existing[@]} -gt 0 ]]; then
    tar -czf "$BACKUP" -C "$PANEL" "${existing[@]}" 2>/dev/null
    ok "backup saved: $BACKUP"
    info "$(du -h "$BACKUP" | cut -f1)"
    info "this archive holds your original files — keep it, it is your way back"
else
    warn "nothing to back up (fresh panel?)"
fi

# ---------------------------------------------------------------------------
# 5. copy the theme in
# ---------------------------------------------------------------------------
step "Installing theme files"

copied=0
while IFS= read -r -d '' src; do
    rel="${src#"$PAYLOAD"/}"
    dest="$PANEL/$rel"
    mkdir -p "$(dirname "$dest")"
    cp -a "$src" "$dest"
    copied=$((copied + 1))
done < <(find "$PAYLOAD" -type f -print0)
ok "$copied files installed"

# ---------------------------------------------------------------------------
# 6. ownership
# ---------------------------------------------------------------------------
step "Setting file ownership to $WEB_USER"
chown -R "$WEB_USER:$WEB_USER" \
    "$PANEL/resources/scripts" \
    "$PANEL/resources/views" \
    "$PANEL/public/assets" \
    "$PANEL/public/themes" \
    "$PANEL/routes" \
    "$PANEL/app/Console" \
    "$PANEL/app/Events" \
    "$PANEL/app/Models" \
    "$PANEL/app/Http/Controllers" \
    "$PANEL/database/migrations" \
    "$PANEL/package.json" \
    "$PANEL/yarn.lock" \
    "$PANEL/tailwind.config.js" 2>/dev/null
ok "ownership set"

# ---------------------------------------------------------------------------
# 7. database migration (the leaderboard table)
# ---------------------------------------------------------------------------
step "Running database migrations"

if [[ -f "$PANEL/database/migrations/2026_10_07_100000_create_server_runtime_totals_table.php" ]]; then
    if runuser -u "$WEB_USER" -- "$PHP_BIN" "$PANEL/artisan" migrate --force 2>&1 | tail -5; then
        ok "migrations applied"
    else
        warn "migration reported a problem — check the output above."
    fi
else
    info "no new migration to run"
fi

# ---------------------------------------------------------------------------
# 8. clear caches
# ---------------------------------------------------------------------------
step "Clearing caches"

for cmd in view:clear config:clear cache:clear; do
    runuser -u "$WEB_USER" -- "$PHP_BIN" "$PANEL/artisan" "$cmd" >/dev/null 2>&1 \
        && ok "$cmd" || warn "$cmd failed (usually harmless)"
done
runuser -u "$WEB_USER" -- "$PHP_BIN" "$PANEL/artisan" queue:restart >/dev/null 2>&1 && ok "queue:restart"

# ---------------------------------------------------------------------------
# 9. seed runtime history (optional, best-effort)
# ---------------------------------------------------------------------------
step "Seeding runtime history for the leaderboard"

if [[ -f "$PANEL/app/Console/Commands/Maintenance/BackfillServerRuntimeCommand.php" ]]; then
    info "reconstructing past uptime from the activity log (this may take a moment)"
    if runuser -u "$WEB_USER" -- "$PHP_BIN" "$PANEL/artisan" p:runtime:backfill --force >/dev/null 2>&1; then
        ok "history reconstructed"
    else
        warn "backfill skipped — the leaderboard will fill in from live sampling instead."
    fi
else
    info "leaderboard command not present, skipping"
fi

# ---------------------------------------------------------------------------
# 10. verify
# ---------------------------------------------------------------------------
step "Verifying the installation"

problems=0
check() {
    if [[ -e "$PANEL/$1" ]]; then ok "$2"; else fail "$2"; problems=$((problems + 1)); fi
}

check "public/themes/pterodactyl/css/nixeon-admin.css"        "admin stylesheet present"
check "public/themes/pterodactyl/css/nixeon-tokens.css"       "design tokens present"
check "public/themes/pterodactyl/fonts/roboto-normal.woff2"   "fonts present"
check "public/assets/manifest.json"                           "asset manifest present"
check "resources/views/layouts/admin.blade.php"               "admin layout present"
check "resources/views/admin/servers/leaderboard.blade.php"   "leaderboard view present"
check "app/Models/ServerRuntimeTotal.php"                     "leaderboard model present"

if grep -q 'nixeon-admin.css' "$PANEL/resources/views/layouts/admin.blade.php" 2>/dev/null; then
    ok "admin layout wired to the theme"
else
    fail "admin layout is not wired to the theme"
    problems=$((problems + 1))
fi

if grep -q 'nx-theme' "$PANEL/resources/views/templates/wrapper.blade.php" 2>/dev/null; then
    ok "front-end theme boot present"
else
    fail "front-end theme boot missing"
    problems=$((problems + 1))
fi

# the front-end bundle must actually exist, or every page renders unstyled
BUNDLE_COUNT="$(find "$PANEL/public/assets" -name 'bundle.*.js' 2>/dev/null | wc -l)"
if [[ "$BUNDLE_COUNT" -gt 0 ]]; then
    ok "front-end bundle present ($BUNDLE_COUNT file(s))"
else
    fail "no bundle.*.js in public/assets — the panel will look unstyled"
    problems=$((problems + 1))
fi

# ---------------------------------------------------------------------------
# done
# ---------------------------------------------------------------------------
printf '\n'
if [[ "$problems" -eq 0 ]]; then
    printf '%s%s  Nixeon 408 installed successfully.%s\n' "$B" "$GRN" "$R"
else
    printf '%s%s  Installed with %d warning(s) — see above.%s\n' "$B" "$YEL" "$problems" "$R"
fi

cat <<EOF

  ${B}Next steps${R}
  ${DIM}────────────────────────────────────────────────────${R}
  1. Hard-refresh the panel in your browser (Ctrl/Cmd+Shift+R).
     The theme is applied per-browser and remembered in localStorage.

  2. Open the admin area and confirm the re-skin:
       ${CYN}https://your-panel/admin${R}

  3. The leaderboard is at:
       ${CYN}https://your-panel/admin/servers/leaderboard${R}
     It fills in from live sampling every minute (via the panel's scheduler).
     Make sure the scheduler cron is running — it already is on a standard
     Pterodactyl install.

  ${B}Rolling back${R}
  ${DIM}────────────────────────────────────────────────────${R}
  Your original files were saved to:
     ${BACKUP:-none}

  To restore them, unpack that archive over the panel:
     ${CYN}sudo tar --overwrite -xzf "$BACKUP" -C $PANEL${R}

  then clear the caches:
     ${CYN}sudo -u $WEB_USER $PHP_BIN $PANEL/artisan view:clear${R}
     ${CYN}sudo -u $WEB_USER $PHP_BIN $PANEL/artisan config:clear${R}

  Finally, delete the files this theme added (they are listed in the
  README under "Manual rollback") and hard-refresh your browser.

EOF
