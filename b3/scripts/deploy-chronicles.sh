#!/usr/bin/env bash
# Deploy CultureChronicles1155 on Base and merge address into deployments + app env.
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

CHAIN_ID="${CHRONICLES_CHAIN_ID:-8453}"
RPC="${RPC_URL:-${BASE_RPC_URL:-https://mainnet.base.org}}"

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Set PRIVATE_KEY in contracts/.env"
  exit 1
fi
if [[ -z "${TREASURY:-}" ]]; then
  echo "Set TREASURY in contracts/.env"
  exit 1
fi

DEPLOYER=$(cast wallet address --private-key "$PRIVATE_KEY")
BAL=$(cast balance "$DEPLOYER" --rpc-url "$RPC")
echo "Deployer: $DEPLOYER"
echo "Balance:  $(cast --to-unit "$BAL" ether) ETH"

echo "Deploying CultureChronicles1155 to chain $CHAIN_ID via $RPC"

forge script script/DeployCultureChronicles.s.sol:DeployCultureChroniclesScript \
  --rpc-url "$RPC" \
  --broadcast \
  --chain-id "$CHAIN_ID"

BROADCAST="$ROOT/contracts/broadcast/DeployCultureChronicles.s.sol/$CHAIN_ID/run-latest.json"
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
  if (tx.contractName === 'CultureChronicles1155' && tx.contractAddress) {
    addr = tx.contractAddress;
    break;
  }
}
if (!addr) { process.exit(1); }
console.log(addr.toLowerCase());
" "$BROADCAST")

echo "CultureChronicles1155 deployed: $ADDR"

node -e "
const fs = require('fs');
const deployPath = process.argv[1];
const addr = process.argv[2];
const chainId = Number(process.argv[3]);
const dep = fs.existsSync(deployPath)
  ? JSON.parse(fs.readFileSync(deployPath, 'utf8'))
  : { chainId, contracts: {} };
dep.contracts = dep.contracts || {};
dep.contracts.CultureChronicles1155 = addr;
fs.writeFileSync(deployPath, JSON.stringify(dep, null, 2) + '\n');
console.log('Updated', deployPath);
" "$DEPLOY_FILE" "$ADDR" "$CHAIN_ID"

# Merge into app/src/data/addresses.json under networks.8453.culture
node -e "
const fs = require('fs');
const path = process.argv[1];
const addr = process.argv[2];
const p = path;
const book = JSON.parse(fs.readFileSync(p, 'utf8'));
book.networks = book.networks || {};
book.networks['8453'] = book.networks['8453'] || {};
book.networks['8453'].culture = book.networks['8453'].culture || {};
book.networks['8453'].culture.CultureChronicles1155 = addr;
book.updated = new Date().toISOString().slice(0, 10);
fs.writeFileSync(p, JSON.stringify(book, null, 2) + '\n');
console.log('Updated', p);
" "$ROOT/app/src/data/addresses.json" "$ADDR"

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
    set_kv "$envfile" "VITE_CULTURE_CHRONICLES_ADDRESS" "$ADDR"
    set_kv "$envfile" "CULTURE_CHRONICLES_ADDRESS" "$ADDR"
    echo "Updated $envfile"
  fi
done

cd "$ROOT" && npm run contracts:sdk && npm --prefix packages/contracts-sdk run build

echo "Done. CultureChronicles1155=$ADDR"
