#!/usr/bin/env bash
# Unified audit gate — grant diligence + tests + security + backtests.
# Usage:
#   npm run audit:gate
#   npm run audit:gate -- --skip-e2e
#   npm run audit:gate -- --write-scorecard
#   npm run audit:gate -- --origin https://app.buildingcultureid.space
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SKIP_E2E=0
WRITE_SCORECARD=0
ORIGIN="${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}"
OUT_DIR="${GRANT_VERIFY_OUT_DIR:-proof-bundles}"
MATRIX_FILE="${OUT_DIR}/.grant-verify-matrix.json"
CHECKS_FILE="$(mktemp)"
hard_fail=0

for arg in "$@"; do
  case "$arg" in
    --skip-e2e) SKIP_E2E=1 ;;
    --write-scorecard) WRITE_SCORECARD=1 ;;
    --origin=*) ORIGIN="${arg#--origin=}" ;;
    --origin) shift; ORIGIN="${1:-$ORIGIN}" ;;
  esac
done

add_check() {
  node -e "
    const fs = require('fs');
    const row = { id: process.argv[1], label: process.argv[2], status: process.argv[3] };
    if (process.argv[4]) row.detail = process.argv[4];
    if (process.argv[5]) row.url = process.argv[5];
    fs.appendFileSync(process.argv[6], JSON.stringify(row) + '\n');
  " "$1" "$2" "$3" "${4:-}" "${5:-}" "$CHECKS_FILE"
  if [[ "$3" == "fail" ]]; then
    hard_fail=1
  fi
}

write_matrix() {
  mkdir -p "$OUT_DIR"
  if [[ -s "$CHECKS_FILE" && -f "$MATRIX_FILE" ]]; then
    node scripts/merge-grant-checks.mjs "$MATRIX_FILE" "$CHECKS_FILE" || true
  elif [[ -s "$CHECKS_FILE" ]]; then
    node scripts/write-grant-matrix.mjs "$CHECKS_FILE" "$ORIGIN" "$MATRIX_FILE" || true
  fi
  if [[ "$WRITE_SCORECARD" == "1" ]]; then
    node scripts/update-audit-scorecard.mjs "$MATRIX_FILE" || true
  fi
}

trap write_matrix EXIT

run_step() {
  local id="$1"
  local label="$2"
  shift 2
  echo ""
  echo "==> audit:gate — $label"
  if "$@"; then
    add_check "$id" "$label" "pass"
  else
    add_check "$id" "$label" "fail" "see console output"
  fi
}

echo "Audit gate started — origin=$ORIGIN"

run_step "forge_all" "All Foundry test suites" bash scripts/forge-test-all.sh

run_step "app_unit" "App unit tests" bash -c 'cd app && npm run test:unit'

if [[ "$SKIP_E2E" == "0" ]]; then
  run_step "app_e2e" "App Playwright e2e" bash -c 'cd app && npm run test:smoke'
else
  add_check "app_e2e" "App Playwright e2e" "warn" "skipped (--skip-e2e)"
fi

run_step "package_tests" "Workspace package tests" bash -c '
  npm test -w @bc/agent-runtime
  npm test -w @bc/bcc-kit
  npm test -w @bc/culture-auth
  npm test -w @bc/support-score
  npm test -w @bc/growth-intelligence
'

run_step "backtest_suite" "Backtest suite" node scripts/run-backtest.mjs

if node scripts/run-security-scan.mjs; then
  add_check "security_scan" "Security scan (npm audit + gitleaks)" "pass"
else
  add_check "security_scan" "Security scan (npm audit + gitleaks)" "fail"
fi

if bash scripts/run-slither.sh; then
  add_check "slither" "Slither static analysis" "pass"
else
  if [[ "${SLITHER_REQUIRED:-0}" == "1" ]]; then
    add_check "slither" "Slither static analysis" "fail"
  else
    add_check "slither" "Slither static analysis" "warn" "install slither or set SLITHER_REQUIRED=1"
  fi
fi

echo ""
echo "==> Grant verify subset (env + contracts bytecode)"
set +e
bash scripts/grant-verify.sh "$ORIGIN"
grant_rc=$?
set -e
if [[ "$grant_rc" -eq 0 ]]; then
  add_check "grant_verify" "Grant verify orchestrator" "pass"
else
  add_check "grant_verify" "Grant verify orchestrator" "fail" "exit_code=$grant_rc"
fi

if [[ "$WRITE_SCORECARD" == "1" ]]; then
  node scripts/update-test-gate-snapshot.mjs || add_check "test_snapshot" "TEST_GATE_SNAPSHOT refresh" "warn"
fi

echo ""
echo "Matrix: $MATRIX_FILE"
if [[ "$hard_fail" -ne 0 ]]; then
  echo "audit:gate FAILED"
  exit 1
fi
echo "audit:gate PASSED"
exit 0
