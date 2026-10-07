#!/usr/bin/env bash
#
# Assembles the publishable payload from the working build tree.
#
# Why a script and not a hand-copy: the payload must be exactly "the files this
# theme changes", nothing more. A manual copy is how you accidentally ship a
# staging endpoint, a .env, or a local-only tweak. The EXCLUDE list below is the
# security boundary, so it lives in one auditable place.
#
# Usage:  bash build-payload.sh [source-tree] [output-dir]
#
# The source tree defaults to ../nixeon-build next to this repo, which is where
# the author keeps the working copy. Pass an explicit path for any other layout.

set -euo pipefail

SRC="${1:-$(cd "$(dirname "$0")/.." && pwd)/nixeon-build}"
OUT="${2:-$(cd "$(dirname "$0")" && pwd)/nixeon}"

if [[ ! -d "$SRC" ]]; then
    echo "source tree not found: $SRC" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# NEVER ship these. Each entry is a specific, named risk — not a blanket ignore.
# ---------------------------------------------------------------------------
EXCLUDE=(
    # Local-only change: relaxes X-Frame-Options when APP_ENV=local so the design
    # could be reviewed inside an iframe. Shipping it would weaken every install.
    "app/Http/Middleware/SetSecurityHeaders.php"

    # Hardcodes a rule about one specific egg id on the author's own panel. Means
    # nothing on another install and would silently block a real egg.
    "app/Http/Controllers/Admin/Nests/EggShareController.php"

    # Staging scaffolding: session-minting bridges, seed pages, screenshot boots.
    "public/nx-boot.php"
    "public/nx-bridge.php"
    "public/nx-seed.html"
    "public/nx-seed2.html"
    "public/nx-matrix.html"
    "public/nx-shot-boot.php"
    "nx-mint-session.php"
    "staging-router.php"
)

# ---------------------------------------------------------------------------
# Files to publish, grouped by why they are here.
# ---------------------------------------------------------------------------
FILES=(
    # --- the theme itself -------------------------------------------------
    "resources/scripts"                                   # full React source (rebuildable)
    "resources/scripts/assets/css/tokens.css"
    "resources/scripts/assets/css/components.css"
    "tailwind.config.js"
    "package.json"
    "yarn.lock"
    "webpack.config.js"
    "babel.config.js"
    "tsconfig.json"

    # --- prebuilt front-end bundle (so no Node.js needed on the target) ---
    "public/assets"

    # --- admin re-skin ----------------------------------------------------
    "public/themes/pterodactyl/css/nixeon-admin.css"
    "public/themes/pterodactyl/css/nixeon-tokens.css"
    "public/themes/pterodactyl/fonts"
    "resources/views/layouts/admin.blade.php"
    "resources/views/templates/wrapper.blade.php"
    "resources/views/admin/servers/index.blade.php"
    "resources/views/admin/servers/leaderboard.blade.php"
    "resources/views/partials/admin/servers/tabs.blade.php"

    # --- runtime leaderboard feature --------------------------------------
    "routes/admin.php"
    "app/Console/Kernel.php"
    "app/Console/Commands/Maintenance/SampleServerRuntimeCommand.php"
    "app/Console/Commands/Maintenance/BackfillServerRuntimeCommand.php"
    "app/Http/Controllers/Admin/Servers/ServerLeaderboardController.php"
    "app/Models/ServerRuntimeTotal.php"
    "database/migrations/2026_10_07_100000_create_server_runtime_totals_table.php"

    # --- genuine bug fix, useful on any panel -----------------------------
    "app/Events/Auth/FailedCaptcha.php"
)

echo "assembling payload"
echo "  source: $SRC"
echo "  output: $OUT"
echo

rm -rf "$OUT"
mkdir -p "$OUT"

copied=0
for rel in "${FILES[@]}"; do
    src="$SRC/$rel"
    if [[ ! -e "$src" ]]; then
        echo "  MISSING: $rel" >&2
        exit 1
    fi
    dest="$OUT/$rel"
    mkdir -p "$(dirname "$dest")"
    if [[ -d "$src" ]]; then
        cp -a "$src/." "$(dirname "$dest")/$(basename "$src")/" 2>/dev/null || cp -a "$src" "$dest"
    else
        cp -a "$src" "$dest"
    fi
    copied=$((copied + 1))
done

# remove the excluded paths if any slipped in via a parent directory copy
for rel in "${EXCLUDE[@]}"; do
    if [[ -e "$OUT/$rel" ]]; then
        rm -rf "$OUT/$rel"
        echo "  excluded: $rel"
    fi
done

# strip anything that should never leave the machine, wherever it landed
find "$OUT" -type f \( \
    -name '.env' -o -name '.env.*' -o -name '*.bak_*' -o -name '*.log' \
    -o -name 'nx-*.php' -o -name 'nx-*.html' -o -name '*.sqlite' \
    \) -delete 2>/dev/null || true
find "$OUT" -type d -name 'node_modules' -prune -exec rm -rf {} + 2>/dev/null || true
find "$OUT" -type d -name '.git' -prune -exec rm -rf {} + 2>/dev/null || true

echo
echo "payload assembled: $copied paths"
echo "size: $(du -sh "$OUT" | cut -f1)"
echo
echo "--- verification ---"
if find "$OUT" -name '.env*' -o -name 'nx-bridge.php' -o -name 'SetSecurityHeaders.php' | grep -q .; then
    echo "FAIL: excluded file present" >&2
    find "$OUT" \( -name '.env*' -o -name 'nx-bridge.php' -o -name 'SetSecurityHeaders.php' \) >&2
    exit 1
fi
echo "no secrets, no staging scaffolding, no local-only middleware: OK"
