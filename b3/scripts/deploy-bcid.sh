#!/usr/bin/env bash
# Deploy BCID v1 contracts (BcidRegistry + BcidSoulboundCredential)
# Usage: BASE_SEPOLIA_RPC=... PRIVATE_KEY=0x... ./scripts/deploy-bcid.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contracts"

RPC="${BASE_SEPOLIA_RPC:-${BASE_RPC_URL:-https://sepolia.base.org}}"
CHAIN_ID="${BCID_CHAIN_ID:-84532}"

echo "Deploying BCID to chain $CHAIN_ID via $RPC"

forge script script/DeployBcid.s.sol:DeployBcidScript \
  --rpc-url "$RPC" \
  --broadcast \
  --chain-id "$CHAIN_ID" \
  -vvv

echo "Set in app/.env:"
echo "  VITE_BCID_CHAIN_ID=$CHAIN_ID"
echo "  VITE_BCID_REGISTRY_ADDRESS=<BcidRegistry from logs>"
echo "  VITE_BCID_CREDENTIAL_ADDRESS=<BcidSoulboundCredential from logs>"
