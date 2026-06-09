#!/usr/bin/env bash
# Audit Grove growth-engine env without printing secret values.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT/deploy/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE"
  exit 1
fi

is_set() {
  local key="$1"
  local val
  val="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\r' || true)"
  [[ -n "$val" && "$val" != "change-me" ]]
}

check_var() {
  local key="$1"
  local required="${2:-optional}"
  if is_set "$key"; then
    echo "OK   $key"
    return 0
  fi
  if [[ "$required" == "required" ]]; then
    echo "FAIL $key (required — engine blocked)"
    return 1
  fi
  echo "WARN $key (not set)"
  return 0
}

fail=0
echo "Grove env check: $ENV_FILE"
echo ""

echo "--- Core (must be set) ---"
check_var GROVE_MARKETING_ADMIN_SECRET required || fail=1
check_var PUBLIC_APP_ORIGIN required || fail=1
check_var PULSE_ANCHOR_ADDRESS required || fail=1

echo ""
echo "--- Auto-posting ---"
check_var GROVE_AUTO_POST
check_var GROVE_ATTEST_POST
check_var GROVE_SCHEDULE_PROFILE

echo ""
echo "--- Channels ---"
for k in GROVE_X_CONSUMER_KEY GROVE_X_CONSUMER_SECRET GROVE_X_ACCESS_TOKEN GROVE_X_ACCESS_TOKEN_SECRET; do
  check_var "$k" || true
done
if is_set GROVE_X_CONSUMER_KEY && is_set GROVE_X_ACCESS_TOKEN; then
  echo "OK   X channel (GROVE_X_* complete)"
elif is_set X_CONSUMER_KEY && is_set X_ACCESS_TOKEN; then
  echo "OK   X channel (official X_* fallback)"
else
  echo "WARN X channel blocked — set GROVE_X_* (see docs/GROVE_ENGINE_UNLOCK.md)"
fi

check_var NEYNAR_API_KEY || true
check_var GROVE_NEYNAR_SIGNER_UUID || true
if is_set NEYNAR_API_KEY && is_set GROVE_NEYNAR_SIGNER_UUID; then
  echo "OK   Farcaster channel (Neynar + Grove signer)"
else
  echo "WARN Farcaster channel blocked — need NEYNAR_API_KEY + GROVE_NEYNAR_SIGNER_UUID"
fi

if check_var TELEGRAM_BOT_TOKEN && check_var GROVE_TELEGRAM_CHAT_ID; then
  echo "OK   Telegram channel"
else
  echo "WARN Telegram channel incomplete"
fi

echo ""
echo "--- Live status (production) ---"
ORIGIN="$(grep -E '^PUBLIC_APP_ORIGIN=' "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '\r' | sed 's|/$||')"
if [[ -n "$ORIGIN" ]]; then
  curl -sf "${ORIGIN}/api/marketing/grove/tick" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
  console.log('  autoPost:', j.autoPost);
  console.log('  xConfigured:', j.xConfigured);
  console.log('  farcasterConfigured:', j.farcasterConfigured);
  console.log('  telegramConfigured:', j.telegramConfigured);
  } catch { console.log('  (tick status unavailable)'); }
});
" || echo "  (could not reach ${ORIGIN}/api/marketing/grove/tick)"
fi

echo ""
if [[ "$fail" -ne 0 ]]; then
  echo "Fix required vars, then: npm run sync:deploy-env && npm run deploy:grove"
  exit 1
fi
echo "Env file OK for core. Complete WARN lines to unlock all channels."
echo "Guide: docs/GROVE_ENGINE_UNLOCK.md"
