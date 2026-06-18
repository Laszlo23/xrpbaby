#!/usr/bin/env bash
# Deploy wBCC + BccBridgeVault and print env vars for relayer wiring.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contracts"

echo "=== Deploy BccBridgeVault (Base) ==="
forge script script/DeployBccBridge.s.sol:DeployBccBridge \
  --rpc-url "${BASE_RPC_URL:?}" --broadcast --chain-id 8453

echo ""
echo "=== Deploy WrappedBCC (BSC) ==="
forge script script/DeployBccBridge.s.sol:DeployWrappedBCC \
  --rpc-url "${BSC_RPC_URL:?}" --broadcast --chain-id 56

echo ""
echo "Set in deploy/.env and app/.env:"
echo "  VITE_BRIDGE_MODE=relayer"
echo "  VITE_BCC_BRIDGE_VAULT=<vault>"
echo "  VITE_WBCC_BSC_ADDRESS=<wbcc>"
echo ""
echo "Wire relayer:"
echo "  BCC_BRIDGE_VAULT=... WBCC_ADDRESS=... BRIDGE_RELAYER_ADDRESS=... \\"
echo "    forge script script/DeployBccBridge.s.sol:WireBccBridge --broadcast"
echo ""
echo "Start relayer: npm run bcc:bridge-relayer"
