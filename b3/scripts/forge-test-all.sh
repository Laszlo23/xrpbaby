#!/usr/bin/env bash
# Run Foundry tests across all first-party contract trees.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

run_forge() {
  local label="$1"
  local dir="$2"
  if [[ ! -d "$dir" ]]; then
    echo "SKIP $label (missing $dir)"
    return 0
  fi
  if [[ ! -f "$dir/foundry.toml" ]]; then
    echo "SKIP $label (no foundry.toml in $dir)"
    return 0
  fi
  echo "==> forge test: $label ($dir)"
  if (cd "$dir" && forge test); then
    echo "OK $label"
  else
    echo "FAIL $label"
    fail=1
  fi
}

run_forge "contracts" "$ROOT/contracts"
run_forge "places" "$ROOT/apps/places"
run_forge "identity" "$ROOT/apps/identity/contracts"
run_forge "art" "$ROOT/apps/art/contracts"

if [[ "$fail" -ne 0 ]]; then
  echo "forge-test-all FAILED"
  exit 1
fi
echo "forge-test-all PASSED"
