#!/usr/bin/env bash
# Deploy BccTwapOracle (or MockBccUsdOracle) on Base mainnet.
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

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "PRIVATE_KEY required" >&2
  exit 1
fi

if [[ -z "$POOL" ]]; then
  echo "Deploying MockBccUsdOracle (set BCC_WETH_POOL_ADDRESS for TWAP oracle)…"
  export BCC_WEI_PER_USD_E6="${BCC_WEI_PER_USD_E6:-1000000000000000}"
  forge script script/DeployMockBccOracle.s.sol:DeployMockBccOracle \
    --rpc-url "$RPC" --broadcast --chain-id 8453
else
  forge script script/DeployBccTwapOracle.s.sol:DeployBccTwapOracle \
    --rpc-url "$RPC" --broadcast --chain-id 8453
fi

echo "Set VITE_BCC_ORACLE_ADDRESS in app env"
