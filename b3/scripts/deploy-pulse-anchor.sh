#!/usr/bin/env bash
# Deploy CulturePulseAnchor and merge address into deployments JSON.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contracts"

CHAIN_ID="${PULSE_ATTEST_CHAIN_ID:-84532}"
RPC="${BASE_SEPOLIA_RPC_URL:-}"
if [[ "$CHAIN_ID" == "8453" ]]; then
  RPC="${BASE_MAINNET_RPC_URL:-${RPC}}"
fi

if [[ -z "${RPC:-}" ]]; then
  echo "Set BASE_SEPOLIA_RPC_URL or BASE_MAINNET_RPC_URL"
  exit 1
fi
if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Set PRIVATE_KEY"
  exit 1
fi

forge script script/DeployPulseAnchor.s.sol:DeployPulseAnchorScript \
  --rpc-url "$RPC" \
  --broadcast \
  ${VERIFY_ARGS:-}

BROADCAST="$ROOT/contracts/broadcast/DeployPulseAnchor.s.sol/$CHAIN_ID/run-latest.json"
DEPLOY_FILE="$ROOT/contracts/deployments/${CHAIN_ID}.json"

if [[ ! -f "$BROADCAST" ]]; then
  echo "Broadcast not found at $BROADCAST — add CulturePulseAnchor address to $DEPLOY_FILE manually"
  exit 1
fi

node -e "
const fs = require('fs');
const broadcast = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
const deployPath = process.argv[2];
const chainId = Number(process.argv[3]);
let addr;
for (const tx of broadcast.transactions || []) {
  if (tx.contractName === 'CulturePulseAnchor' && tx.contractAddress) {
    addr = tx.contractAddress;
    break;
  }
}
if (!addr) { console.error('CulturePulseAnchor not in broadcast'); process.exit(1); }
const dep = fs.existsSync(deployPath)
  ? JSON.parse(fs.readFileSync(deployPath, 'utf8'))
  : { chainId, contracts: {} };
dep.contracts = dep.contracts || {};
dep.contracts.CulturePulseAnchor = addr;
fs.writeFileSync(deployPath, JSON.stringify(dep, null, 2) + '\n');
console.log('Updated', deployPath, 'CulturePulseAnchor=', addr);
" "$BROADCAST" "$DEPLOY_FILE" "$CHAIN_ID"

cd "$ROOT" && npm run contracts:sdk

ANCHOR_ADDR=$(node -e "const d=require('$DEPLOY_FILE'); console.log(d.contracts.CulturePulseAnchor||'')")
echo "Set PULSE_ANCHOR_ADDRESS=$ANCHOR_ADDR in app/.env"
