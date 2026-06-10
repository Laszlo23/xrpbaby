#!/usr/bin/env bash
# Deploy BccTwapOracle (or MockBccUsdOracle) on Base mainnet and sync registry.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS_ENV="$ROOT/contracts/.env"
if [[ -f "$CONTRACTS_ENV" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$CONTRACTS_ENV"
  set +a
fi
cd "$ROOT/contracts"

BCC="${BCC_TOKEN_ADDRESS:-0xb890a5289f789f1346032ccc1847939e855fab07}"
POOL="${BCC_WETH_POOL_ADDRESS:-}"
FEED="${ETH_USD_FEED:-0x71041dddad35915F74ccc6ae32f57871161a48649}"
RPC="${BASE_RPC_URL:-https://mainnet.base.org}"
CHAIN_ID="${CHAIN_ID:-8453}"

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "PRIVATE_KEY required" >&2
  exit 1
fi

export BCC_TOKEN_ADDRESS="$BCC"
export ETH_USD_FEED="$FEED"

if [[ -z "$POOL" ]]; then
  echo "Deploying MockBccUsdOracle (set BCC_WETH_POOL_ADDRESS for TWAP oracle)..."
  export BCC_WEI_PER_USD_E6="${BCC_WEI_PER_USD_E6:-1000000000000000}"
  forge script script/DeployMockBccOracle.s.sol:DeployMockBccOracle \
    --rpc-url "$RPC" --broadcast --chain-id "$CHAIN_ID"
  REGISTRY_KEY="MockBccUsdOracle"
  SCRIPT_FILE="DeployMockBccOracle.s.sol"
else
  if [[ ${#POOL} -ne 42 ]]; then
    echo "BCC_WETH_POOL_ADDRESS must be a Uniswap V3 pool contract (42 chars)." >&2
    echo "Current BCC liquidity on Base is Uniswap v4 (pool id, not a v3 address)." >&2
    echo "BccTwapOracle requires a v3 pool — keep MockBccUsdOracle until a v3 pool is seeded." >&2
    exit 1
  fi
  export BCC_WETH_POOL_ADDRESS="$POOL"
  echo "Deploying BccTwapOracle with pool ${POOL}..."
  forge script script/DeployBccTwapOracle.s.sol:DeployBccTwapOracle \
    --rpc-url "$RPC" --broadcast --chain-id "$CHAIN_ID"
  REGISTRY_KEY="BccTwapOracle"
  SCRIPT_FILE="DeployBccTwapOracle.s.sol"
fi

node "$ROOT/scripts/write-bcc-from-broadcast.mjs" "$CHAIN_ID" "$SCRIPT_FILE" "$REGISTRY_KEY"
node "$ROOT/scripts/sync-bcc-addresses-doc.mjs"
npm run contracts:sdk --prefix "$ROOT"
bash "$ROOT/scripts/sync-vite-env.sh" 2>/dev/null || true

ORACLE="$(node -e "
const j=require('$ROOT/contracts/deployments/bcc-$CHAIN_ID.json');
const key='$REGISTRY_KEY';
console.log(j.contracts?.[key] || '');
")"

echo ""
echo "${REGISTRY_KEY} deployed: $ORACLE"
echo "Set VITE_BCC_ORACLE_ADDRESS=$ORACLE in deploy/.env and redeploy web image"
echo ""
echo "TWAP note: BCC/WETH on Base is currently Uniswap v4 only. MockBccUsdOracle remains"
echo "production oracle until a Uniswap v3 pool is seeded for BccTwapOracle."
