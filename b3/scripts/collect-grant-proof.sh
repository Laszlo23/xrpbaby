#!/usr/bin/env bash
# Collect grant proof bundle: verification matrix + API snapshots + addresses.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE="${1:-${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}}"
BASE="${BASE%/}"
OUT_DIR="${2:-proof-bundles}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="${OUT_DIR}/grant-proof-${TS}.json"

mkdir -p "$OUT_DIR"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Running grant verification gates"
GRANT_VERIFY_OUT_DIR="$OUT_DIR" bash scripts/grant-verify.sh "$BASE" || true

MATRIX_FILE="${OUT_DIR}/.grant-verify-matrix.json"
if [[ ! -f "$MATRIX_FILE" ]]; then
  echo "Missing verification matrix at $MATRIX_FILE"
  exit 1
fi

json_or_null() {
  local url="$1"
  local out="$2"
  if curl -fsS --max-time 25 "$url" -o "$out" 2>/dev/null; then
    return 0
  fi
  echo "null" >"$out"
}

json_or_null "${BASE}/.well-known/agent.json" "$TMP/agent.json"
json_or_null "${BASE}/api/trading/health" "$TMP/trading.json"
json_or_null "${BASE}/api/market/health" "$TMP/market-health.json"
json_or_null "${BASE}/api/market/bcc" "$TMP/market-bcc.json"
json_or_null "${BASE}/api/pulse/metrics" "$TMP/pulse.json"
json_or_null "${BASE}/api/marketing/grove/tick" "$TMP/grove.json"
json_or_null "${BASE}/api/grant/verification" "$TMP/grant-api.json"

HTTP_AGENT_CARD="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/.well-known/agent.json" || true)"
HTTP_X402_PREMIUM="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/x402/premium" || true)"
HTTP_TRADING_HEALTH="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/trading/health" || true)"
HTTP_MARKET_HEALTH="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/market/health" || true)"
HTTP_MARKET_BCC="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/market/bcc" || true)"
HTTP_PULSE_METRICS="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/pulse/metrics" || true)"
HTTP_GROVE_TICK="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/marketing/grove/tick" || true)"
HTTP_GRANT_VERIFICATION="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/grant/verification" || true)"

CONTRACTS_AUDIT_NOTE=""
if [[ -f docs/CONTRACTS_AUDIT.md ]]; then
  CONTRACTS_AUDIT_NOTE="$(head -n 5 docs/CONTRACTS_AUDIT.md | tr '\n' ' ')"
fi

node scripts/build-grant-proof-bundle.mjs \
  --matrix "$MATRIX_FILE" \
  --addresses docs/ADDRESSES.json \
  --test-snapshot docs/TEST_GATE_SNAPSHOT.json \
  --agent "$TMP/agent.json" \
  --trading "$TMP/trading.json" \
  --market-health "$TMP/market-health.json" \
  --market-bcc "$TMP/market-bcc.json" \
  --pulse "$TMP/pulse.json" \
  --grove "$TMP/grove.json" \
  --grant-api "$TMP/grant-api.json" \
  --out "$OUT_FILE" \
  --origin "$BASE" \
  --ts "$TS" \
  --contracts-note "$CONTRACTS_AUDIT_NOTE" \
  --http-agent "$HTTP_AGENT_CARD" \
  --http-x402 "$HTTP_X402_PREMIUM" \
  --http-trading "$HTTP_TRADING_HEALTH" \
  --http-market-health "$HTTP_MARKET_HEALTH" \
  --http-market-bcc "$HTTP_MARKET_BCC" \
  --http-pulse "$HTTP_PULSE_METRICS" \
  --http-grove "$HTTP_GROVE_TICK" \
  --http-grant "$HTTP_GRANT_VERIFICATION"

MD_FILE="${OUT_DIR}/grant-verification-${TS}.md"
node scripts/render-grant-report.mjs "$OUT_FILE" "$MD_FILE"

echo "Grant proof bundle saved: ${OUT_FILE}"
echo "Grant verification report: ${MD_FILE}"
