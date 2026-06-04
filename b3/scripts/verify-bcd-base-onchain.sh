#!/usr/bin/env bash
# Read-only checks: legacy BCD + canonical BCC on Base.
# Requires: cast (Foundry). Usage:
#   ./b3/scripts/verify-bcd-base-onchain.sh
#   BASE_RPC_URL=https://mainnet.base.org ./b3/scripts/verify-bcd-base-onchain.sh

set -euo pipefail

RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

BCD_LEGACY="0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72"
BCC_CANONICAL="0xb890a5289f789f1346032ccc1847939e855fab07"
CLAIM="0x2bae6b04d0d1c8016cc863509395b68eb0021f58"

echo "RPC: $RPC"
echo "---"

probe_token() {
  local label="$1"
  local token="$2"
  echo "== $label ($token) =="
  safe_call "$token" symbol 'symbol()(string)'
  safe_call "$token" name 'name()(string)'
  safe_call "$token" decimals 'decimals()(uint8)'
  safe_call "$token" totalSupply 'totalSupply()(uint256)'
  echo ""
}

safe_call() {
  local addr="$1"
  local label="$2"
  local sig="$3"
  echo -n "${label}: "
  if out=$(cast call "$addr" "$sig" --rpc-url "$RPC" 2>/dev/null); then
    echo "$out"
  else
    echo "(revert)"
  fi
}

probe_token "Legacy BCD" "$BCD_LEGACY"
probe_token "Canonical BCC" "$BCC_CANONICAL"

echo "BCDGenesisClaim ($CLAIM) → token():"
if got=$(cast call "$CLAIM" "token()(address)" --rpc-url "$RPC" 2>/dev/null); then
  echo "$got"
  g_lc=$(echo "$got" | head -1 | tr -d '"' | tr '[:upper:]' '[:lower:]')
  bcd_lc=$(echo "$BCD_LEGACY" | tr '[:upper:]' '[:lower:]')
  if [[ "${g_lc}" == "${bcd_lc}" ]]; then
    echo "OK: genesis claim mints legacy BCD (not BCC)"
  else
    echo "WARN: genesis claim token differs from expected BCD $BCD_LEGACY"
  fi
else
  echo "(revert)"
fi

echo "done."
