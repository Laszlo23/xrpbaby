#!/usr/bin/env bash
# Set CultureLayerIdentity.mintPrice on Base to ~$1.11 USD in ETH.
# Requires: forge, PRIVATE_KEY (contract owner), optional ETH_USD for wei calc.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

eval "$(node scripts/identity-mint-price-wei.mjs | grep '^MINT_PRICE_WEI=')"
export MINT_PRICE_WEI
export IDENTITY_CONTRACT_ADDRESS="${IDENTITY_CONTRACT_ADDRESS:-0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863}"
RPC="${VITE_RPC_URL:-https://mainnet.base.org}"

echo "Contract: $IDENTITY_CONTRACT_ADDRESS"
echo "RPC: $RPC"
echo "New mintPrice wei: $MINT_PRICE_WEI"

CURRENT=$(cast call "$IDENTITY_CONTRACT_ADDRESS" "mintPrice()(uint256)" --rpc-url "$RPC")
echo "Current mintPrice wei: $CURRENT"

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "PRIVATE_KEY not set — skipping broadcast. Export owner key and re-run."
  exit 0
fi

cd apps/identity/contracts
forge script script/SetMintPrice.s.sol:SetMintPrice \
  --rpc-url "$RPC" \
  --broadcast \
  -vvv

echo "Done. Verify on Basescan read contract mintPrice."
