#!/usr/bin/env bash
# Read-only checks: BuildingCultureDollar on Base vs contracts-sdk addresses.
# Requires: cast (Foundry). Usage:
#   ./b3/scripts/verify-bcd-base-onchain.sh
#   BASE_RPC_URL=https://mainnet.base.org ./b3/scripts/verify-bcd-base-onchain.sh

set -euo pipefail

RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

TOKEN="0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72"
CLAIM="0x2bae6b04d0d1c8016cc863509395b68eb0021f58"

echo "RPC: $RPC"
echo "BCD token: $TOKEN"
echo "---"

safe_call() {
  local label="$1"
  local sig="$2"
  echo -n "${label}: "
  if out=$(cast call "$TOKEN" "$sig" --rpc-url "$RPC" 2>/dev/null); then
    echo "$out"
  else
    echo "(revert)"
  fi
}

safe_call symbol 'symbol()(string)'
safe_call decimals 'decimals()(uint8)'
safe_call cap 'cap()(uint256)'
safe_call totalSupply 'totalSupply()(uint256)'
safe_call owner 'owner()(address)'

echo -n "genesisClaimContract: "
if got=$(cast call "$TOKEN" "genesisClaimContract()(address)" --rpc-url "$RPC" 2>/dev/null); then
  echo "$got"
  g_lc=$(echo "$got" | head -1 | tr -d '"' | tr '[:upper:]' '[:lower:]')
  exp_lc=$(echo "$CLAIM" | tr '[:upper:]' '[:lower:]')
  if [[ "${g_lc}" == "${exp_lc}" ]]; then
    echo "genesisClaimContract matches deployments/8453.json"
  else
    echo "WARN: genesisClaimContract differs from deployments/8453.json expected $CLAIM"
  fi
else
  echo "(revert)"
fi

echo -n "fixedSaleContract: "
cast call "$TOKEN" "fixedSaleContract()(address)" --rpc-url "$RPC" 2>/dev/null || echo "(revert — unset or different ABI)"

echo -n "ownerMintDisabled: "
cast call "$TOKEN" "ownerMintDisabled()(bool)" --rpc-url "$RPC" 2>/dev/null || echo "(revert — verify on BaseScan if getter missing)"

echo "done."
