#!/usr/bin/env bash
# Static analysis on first-party Solidity (optional if slither not installed).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v slither >/dev/null 2>&1; then
  echo "WARN slither not installed — pip install slither-analyzer"
  if [[ "${SLITHER_REQUIRED:-0}" == "1" ]]; then
    exit 1
  fi
  exit 0
fi

fail=0
for dir in contracts apps/places apps/identity/contracts apps/art/contracts; do
  if [[ ! -f "$dir/foundry.toml" ]]; then
    continue
  fi
  echo "==> slither $dir"
  if slither "$dir" --config "$ROOT/contracts/slither.config.json" --fail-high; then
    echo "OK slither $dir"
  else
    echo "FAIL slither $dir"
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "slither FAILED"
  exit 1
fi
echo "slither PASSED"
