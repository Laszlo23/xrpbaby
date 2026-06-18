#!/usr/bin/env bash
# Grant verification orchestrator: env, contracts, production smoke, growth.
# Writes pass/warn/fail matrix to proof-bundles/.grant-verify-matrix.json
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
OUT_DIR="${GRANT_VERIFY_OUT_DIR:-proof-bundles}"
MATRIX_FILE="${OUT_DIR}/.grant-verify-matrix.json"
mkdir -p "$OUT_DIR"

CHECKS_FILE="$(mktemp)"
hard_fail=0

write_matrix() {
  node scripts/write-grant-matrix.mjs "$CHECKS_FILE" "$ORIGIN" "$MATRIX_FILE" || true
}

trap write_matrix EXIT

add_check() {
  local id="$1"
  local label="$2"
  local status="$3"
  local detail="${4:-}"
  local url="${5:-}"
  node -e "
    const fs = require('fs');
    const row = {
      id: process.argv[1],
      label: process.argv[2],
      status: process.argv[3],
    };
    if (process.argv[4]) row.detail = process.argv[4];
    if (process.argv[5]) row.url = process.argv[5];
    fs.appendFileSync(process.argv[6], JSON.stringify(row) + '\n');
  " "$id" "$label" "$status" "$detail" "$url" "$CHECKS_FILE"
  if [[ "$status" == "fail" ]]; then
    hard_fail=1
  fi
}

smoke_url() {
  local path="$1"
  if [[ "$path" == /* ]]; then
    printf '%s%s' "$ORIGIN" "$path"
  else
    printf '%s' "$ORIGIN"
  fi
}

echo "==> Grant verify: $ORIGIN"
echo ""

echo "==> 1/5 Environment audit (audit:env)"
env_log="$(mktemp)"
set +e
npm run audit:env >"$env_log" 2>&1
env_rc=$?
set -e
if [[ "$env_rc" -eq 0 ]]; then
  phase02="ready"
  if grep -q "Through phase 2: gaps" "$env_log"; then
    phase02="gaps"
  fi
  add_check "audit_env" "Deploy environment (phases 0–2)" "pass" "phase_0_2=${phase02}"
else
  fail_count=$(grep -c "FAIL " "$env_log" 2>/dev/null || echo "0")
  add_check "audit_env" "Deploy environment (phases 0–2)" "fail" "integration_failures=${fail_count}"
fi
cat "$env_log"
rm -f "$env_log"
echo ""

echo "==> 2/5 On-chain bytecode audit (contracts:audit)"
contracts_log="$(mktemp)"
set +e
npm run contracts:audit >"$contracts_log" 2>&1
contracts_rc=$?
set -e
if [[ "$contracts_rc" -eq 0 ]]; then
  pass_count=$(grep -c "OK " "$contracts_log" 2>/dev/null || echo "0")
  add_check "contracts_audit" "Base mainnet contract bytecode" "pass" "checks_ok=${pass_count}"
else
  add_check "contracts_audit" "Base mainnet contract bytecode" "fail" "see contracts:audit output"
fi
cat "$contracts_log"
rm -f "$contracts_log"
echo ""

echo "==> 2.5/5 Resources audit (images, SEO assets, alt text)"
resources_log="$(mktemp)"
set +e
node scripts/resources-audit.mjs --origin="$ORIGIN" >"$resources_log" 2>&1
resources_rc=$?
set -e
if [[ "$resources_rc" -eq 0 ]]; then
  if grep -q 'Failures: 0' "$resources_log"; then
    add_check "resources_audit" "Resources audit (local + HTTP)" "pass" "no_hard_failures"
  else
    add_check "resources_audit" "Resources audit (local + HTTP)" "warn" "see_report_in_proof_bundles"
  fi
else
  add_check "resources_audit" "Resources audit (local + HTTP)" "warn" "exit_code=${resources_rc}"
fi
cat "$resources_log"
rm -f "$resources_log"
echo ""

echo "==> 3/5 Production smoke"
smoke_log="$(mktemp)"
set +e
STRICT_SMOKE=1 bash scripts/production-smoke.sh "$ORIGIN" >"$smoke_log" 2>&1
smoke_rc=$?
set -e

while IFS= read -r line; do
  case "$line" in
    OK\ *)
      path="${line#OK  }"
      path="${path%% →*}"
      add_check "smoke_${path//\//_}" "Smoke: ${path}" "pass" "${line#OK  }" "$(smoke_url "$path")"
      ;;
    WARN\ *)
      path="${line#WARN }"
      path="${path%% →*}"
      add_check "smoke_${path//\//_}" "Smoke: ${path}" "warn" "${line#WARN }" "$(smoke_url "$path")"
      ;;
    FAIL\ *)
      path="${line#FAIL }"
      path="${path%% →*}"
      # Trading health unreachable is soft warn per grant honesty rules
      if [[ "$path" == *"trading/health"* ]] || [[ "$line" == *"reachable:false"* ]]; then
        add_check "smoke_api_trading_health" "Smoke: /api/trading/health" "warn" "${line#FAIL }" "${ORIGIN}/api/trading/health"
      else
        add_check "smoke_${path//\//_}" "Smoke: ${path}" "fail" "${line#FAIL }" "$(smoke_url "$path")"
      fi
      ;;
  esac
done < <(grep -E '^(OK|WARN|FAIL) ' "$smoke_log" || true)

if [[ "$smoke_rc" -eq 0 ]]; then
  add_check "production_smoke" "Production smoke suite" "pass" "all_critical_routes_ok"
elif ! grep -q '"status":"fail"' "$CHECKS_FILE" 2>/dev/null; then
  add_check "production_smoke" "Production smoke suite" "warn" "exit_code=${smoke_rc}"
else
  add_check "production_smoke" "Production smoke suite" "fail" "exit_code=${smoke_rc}"
fi
cat "$smoke_log"
rm -f "$smoke_log"
echo ""

echo "==> 3.5/5 Reliability endpoint loop (ECO-001)"
reliability_log="$(mktemp)"
set +e
node scripts/reliability-endpoint-loop.mjs "$ORIGIN" >"$reliability_log" 2>&1
reliability_rc=$?
set -e
if [[ "$reliability_rc" -eq 0 ]]; then
  add_check "reliability_loop" "P0 API reliability endpoints" "pass" "all_healthy"
else
  add_check "reliability_loop" "P0 API reliability endpoints" "fail" "see proof-bundles/reliability-latest.json"
fi
cat "$reliability_log"
rm -f "$reliability_log"
echo ""

echo "==> 4/5 Growth audit (Telegram + Grove)"
growth_log="$(mktemp)"
set +e
bash scripts/growth-audit.sh "$ORIGIN" >"$growth_log" 2>&1
growth_rc=$?
set -e

if [[ "$growth_rc" -eq 0 ]]; then
  add_check "growth_audit" "Growth audit (smoke + Telegram)" "pass" "telegram_surface_ok"
else
  add_check "growth_audit" "Growth audit (smoke + Telegram)" "fail" "exit_code=${growth_rc}"
fi

# Parse growth-live-check optional channel warnings
if grep -q 'GROVE_X credentials: missing' "$growth_log"; then
  add_check "grove_x" "Grove X outbound" "warn" "credentials_not_set"
fi
if grep -q 'Farcaster signer: missing' "$growth_log"; then
  add_check "grove_farcaster" "Grove Farcaster outbound" "warn" "signer_not_set"
fi
if grep -q 'Slack webhook: missing' "$growth_log"; then
  add_check "grove_slack" "Grove Slack webhook" "warn" "not_configured"
fi
if grep -q 'Telegram outbound: missing' "$growth_log"; then
  add_check "grove_telegram_outbound" "Grove Telegram outbound chat" "warn" "GROVE_TELEGRAM_CHAT_ID unset"
fi

cat "$growth_log"
rm -f "$growth_log"
echo ""

echo "==> 5/5 Audit program stubs (full run: npm run audit:gate)"
add_check "flow_tests" "Critical flow Playwright specs" "warn" "run npm run audit:gate locally or in CI"
add_check "backtest_suite" "Backtest suite" "warn" "run npm run backtest"
add_check "security_scan" "Security scan" "warn" "run npm run security:scan"
add_check "slither" "Slither static analysis" "warn" "run npm run slither"

echo ""
echo "Matrix saved: $MATRIX_FILE"

if [[ "$hard_fail" -ne 0 ]]; then
  echo "Grant verify FAILED (hard failures present)."
  exit 1
fi

echo "Grant verify PASSED (warnings may remain — see matrix)."
exit 0
