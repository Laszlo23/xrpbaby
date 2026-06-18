#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}}"
BASE="${BASE%/}"
OUT_DIR="${2:-proof-bundles}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="${OUT_DIR}/investor-proof-${TS}.json"

mkdir -p "$OUT_DIR"

json_or_null() {
  local url="$1"
  if curl -fsS --max-time 25 "$url" 2>/dev/null; then
    return 0
  fi
  printf 'null'
}

HTTP_AGENT_CARD="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/.well-known/agent.json" || true)"
HTTP_X402_PREMIUM="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/x402/premium" || true)"
HTTP_TRADING_HEALTH="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/trading/health" || true)"
HTTP_MARKET_HEALTH="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/market/health" || true)"
HTTP_MARKET_BCC="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/market/bcc" || true)"
HTTP_PULSE_METRICS="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/pulse/metrics" || true)"
HTTP_GROVE_TICK="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/marketing/grove/tick" || true)"
HTTP_TREASURY_BALANCES="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/investors/treasury-balances" || true)"
HTTP_XRPL_INTAKE="$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/investors/xrpl-intake" || true)"

AGENT_CARD="$(json_or_null "${BASE}/.well-known/agent.json")"
TRADING_HEALTH="$(json_or_null "${BASE}/api/trading/health")"
MARKET_HEALTH="$(json_or_null "${BASE}/api/market/health")"
MARKET_BCC="$(json_or_null "${BASE}/api/market/bcc")"
PULSE_METRICS="$(json_or_null "${BASE}/api/pulse/metrics")"
GROVE_TICK="$(json_or_null "${BASE}/api/marketing/grove/tick")"
TREASURY_BALANCES="$(json_or_null "${BASE}/api/investors/treasury-balances")"
XRPL_INTAKE="$(json_or_null "${BASE}/api/investors/xrpl-intake")"

cat > "$OUT_FILE" <<EOF
{
  "generatedAtUtc": "${TS}",
  "baseOrigin": "${BASE}",
  "httpChecks": {
    "agentCard": "${HTTP_AGENT_CARD}",
    "x402Premium": "${HTTP_X402_PREMIUM}",
    "tradingHealth": "${HTTP_TRADING_HEALTH}",
    "marketHealth": "${HTTP_MARKET_HEALTH}",
    "marketBcc": "${HTTP_MARKET_BCC}",
    "pulseMetrics": "${HTTP_PULSE_METRICS}",
    "groveTick": "${HTTP_GROVE_TICK}",
    "treasuryBalances": "${HTTP_TREASURY_BALANCES}",
    "xrplIntake": "${HTTP_XRPL_INTAKE}"
  },
  "snapshots": {
    "agentCard": ${AGENT_CARD},
    "tradingHealth": ${TRADING_HEALTH},
    "marketHealth": ${MARKET_HEALTH},
    "marketBcc": ${MARKET_BCC},
    "pulseMetrics": ${PULSE_METRICS},
    "groveTick": ${GROVE_TICK},
    "treasuryBalances": ${TREASURY_BALANCES},
    "xrplTestnetIntake": ${XRPL_INTAKE}
  },
  "manualRevenueProof": {
    "externalPaidTransactionTxHash": "",
    "settlementRecipientAddress": "",
    "settlementLogReference": "",
    "counterparty": "",
    "notes": ""
  }
}
EOF

echo "Investor proof bundle saved: ${OUT_FILE}"
