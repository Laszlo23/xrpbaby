#!/usr/bin/env bash
# Production growth audit: core smoke + Telegram Mini App + Grove agent readiness.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f deploy/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source deploy/.env
  set +a
fi

ORIGIN="${1:-${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}}"
ORIGIN="${ORIGIN%/}"

echo "==> Growth audit: $ORIGIN"
echo ""

echo "==> 1/2 Production smoke (includes Telegram gates)"
bash scripts/production-smoke.sh "$ORIGIN"
echo ""

echo "==> 2/2 Grove + Telegram surface audit"
(
  export PUBLIC_APP_ORIGIN="$ORIGIN"
  cd app
  node scripts/growth-live-check.mjs --origin "$ORIGIN"
)

cat <<EOF

==> Growth audit passed

Manual sign-off still required:
  • Open https://t.me/buildingcultureappbot on phone → daily tap-in → Play tab → Rank tab (TON bonus optional)
  • Grove X/Farcaster optional until GROVE_X_* / NEYNAR credentials are set
EOF
