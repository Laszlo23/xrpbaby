#!/usr/bin/env bash
# Deploy BCD + genesis claim on Base Sepolia and refresh contracts-sdk.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contracts"

if [[ -z "${BASE_SEPOLIA_RPC_URL:-}" ]]; then
  echo "Set BASE_SEPOLIA_RPC_URL (e.g. https://sepolia.base.org)"
  exit 1
fi
if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Set PRIVATE_KEY for deployer"
  exit 1
fi

export TREASURY="${TREASURY:-$(cast wallet address --private-key "$PRIVATE_KEY")}"
export GENESIS_MERKLE_ROOT="${GENESIS_MERKLE_ROOT:-0x0000000000000000000000000000000000000000000000000000000000000000}"
export GENESIS_CLAIM_FEE_WEI="${GENESIS_CLAIM_FEE_WEI:-0}"
export GENESIS_ENDS_AT="${GENESIS_ENDS_AT:-0}"

echo "Deployer treasury: $TREASURY"
echo "Merkle root (dormant until updated): $GENESIS_MERKLE_ROOT"

forge script script/DeployBCD.s.sol:DeployBCDScript \
  --rpc-url "$BASE_SEPOLIA_RPC_URL" \
  --broadcast \
  ${VERIFY_ARGS:---verify}

echo "==> Writing contracts/deployments/84532.json from broadcast…"
node "$ROOT/scripts/write-84532-from-broadcast.mjs"

echo "==> Syncing contracts-sdk…"
cd "$ROOT" && npm run contracts:sdk

echo ""
echo "Staging app env (app/.env):"
echo "  VITE_BCD_CHAIN_ID=84532"
echo "  VITE_EVM_NETWORK=base-sepolia"
echo "  VITE_BCD_TOKEN_ADDRESS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$ROOT/contracts/deployments/84532.json','utf8')).contracts.BuildingCultureDollar)")"
echo "  VITE_BCD_GENESIS_CLAIM_ADDRESS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$ROOT/contracts/deployments/84532.json','utf8')).contracts.BCDGenesisClaim)")"
