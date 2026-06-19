#!/usr/bin/env bash
# Deploy PanicSwitchAttestation on Base and merge address into deployments + app env.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS_ENV="$ROOT/contracts/.env"
DEPLOY_ENV="$ROOT/deploy/.env"
APP_ENV="$ROOT/app/.env"

for f in "$CONTRACTS_ENV" "$DEPLOY_ENV" "$APP_ENV"; do
  if [[ -f "$f" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
  fi
done

cd "$ROOT/contracts"

CHAIN_ID="${PANIC_ATTEST_CHAIN_ID:-8453}"
RPC="${BASE_RPC_URL:-${BASE_MAINNET_RPC_URL:-https://mainnet.base.org}}"

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Set PRIVATE_KEY in contracts/.env"
  exit 1
fi

echo "Deploying PanicSwitchAttestation to chain $CHAIN_ID via $RPC"

forge script script/DeployPanicSwitchAttestation.s.sol:DeployPanicSwitchAttestationScript \
  --rpc-url "$RPC" \
  --broadcast \
  --chain-id "$CHAIN_ID"

BROADCAST="$ROOT/contracts/broadcast/DeployPanicSwitchAttestation.s.sol/$CHAIN_ID/run-latest.json"
DEPLOY_FILE="$ROOT/contracts/deployments/${CHAIN_ID}.json"

if [[ ! -f "$BROADCAST" ]]; then
  echo "Broadcast not found at $BROADCAST"
  exit 1
fi

ADDR=$(node -e "
const fs = require('fs');
const broadcast = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
let addr;
for (const tx of broadcast.transactions || []) {
  if (tx.contractName === 'PanicSwitchAttestation' && tx.contractAddress) {
    addr = tx.contractAddress;
    break;
  }
}
if (!addr) { process.exit(1); }
console.log(addr.toLowerCase());
" "$BROADCAST")

echo "PanicSwitchAttestation deployed: $ADDR"

node -e "
const fs = require('fs');
const deployPath = process.argv[1];
const addr = process.argv[2];
const chainId = Number(process.argv[3]);
const dep = fs.existsSync(deployPath)
  ? JSON.parse(fs.readFileSync(deployPath, 'utf8'))
  : { chainId, contracts: {} };
dep.contracts = dep.contracts || {};
dep.contracts.PanicSwitchAttestation = addr;
fs.writeFileSync(deployPath, JSON.stringify(dep, null, 2) + '\n');
console.log('Updated', deployPath);
" "$DEPLOY_FILE" "$ADDR" "$CHAIN_ID"

set_kv() {
  local file="$1" key="$2" val="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    if [[ "$(uname)" == Darwin ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "$file"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    fi
  else
    echo "${key}=${val}" >> "$file"
  fi
}

for envfile in "$APP_ENV" "$DEPLOY_ENV"; do
  if [[ -f "$envfile" ]]; then
    set_kv "$envfile" "VITE_PANIC_SWITCH_ATTESTATION_ADDRESS" "$ADDR"
    set_kv "$envfile" "PANIC_SWITCH_ATTESTATION_ADDRESS" "$ADDR"
    echo "Updated $envfile"
  fi
done

cd "$ROOT" && npm run contracts:sdk

echo "Done. PanicSwitchAttestation=$ADDR"
