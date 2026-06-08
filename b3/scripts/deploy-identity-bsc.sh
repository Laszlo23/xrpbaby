#!/usr/bin/env bash
# Deploy CultureLayerIdentity to BNB Smart Chain mainnet (chain 56).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS="$ROOT/apps/identity/contracts"
cd "$CONTRACTS"

ENV_FILE="${IDENTITY_DEPLOY_ENV:-$ROOT/app/.env}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "PRIVATE_KEY is required in $ENV_FILE" >&2
  exit 1
fi

RPC="${BSC_RPC_URL:-https://bsc-dataseed.binance.org}"
BNB_USD="${BNB_USD:-600}"
export MINT_PRICE_WEI
MINT_PRICE_WEI="$(node "$ROOT/scripts/identity-mint-price-wei.mjs" --native bnb --bnb-usd "$BNB_USD" | awk -F= '/^MINT_PRICE_WEI=/{print $2}')"

echo "Deploying CultureLayerIdentity to BSC (mintPriceWei=$MINT_PRICE_WEI)…"
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC" \
  --broadcast \
  --chain-id 56

echo ""
echo "Update app env:"
echo "  VITE_IDENTITY_BSC_CHAIN_ID=56"
echo "  VITE_IDENTITY_BSC_CONTRACT_ADDRESS=<address from broadcast>"
echo "Then update apps/identity/contracts/deployments/56.json and b3/docs/ADDRESSES.md"
