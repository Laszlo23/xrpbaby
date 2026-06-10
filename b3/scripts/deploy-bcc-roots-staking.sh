#!/usr/bin/env bash
# Deploy BccRootsStaking on Base mainnet (8453) or Base Sepolia (84532).
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

CHAIN_ID="${CHAIN_ID:-8453}"
BCC="${BCC_TOKEN_ADDRESS:-0xb890a5289f789f1346032ccc1847939e855fab07}"
ADMIN="${ADMIN_ADDRESS:-0xCe03F6E734cC48393Ce41b257E998c68b521EB5c}"
COOLDOWN="${COOLDOWN_PERIOD:-604800}"

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "PRIVATE_KEY required (contracts/.env)" >&2
  exit 1
fi

if [[ "$CHAIN_ID" == "8453" ]]; then
  RPC="${BASE_RPC_URL:-https://mainnet.base.org}"
elif [[ "$CHAIN_ID" == "84532" ]]; then
  RPC="${BASE_SEPOLIA_RPC:-https://sepolia.base.org}"
else
  echo "Unsupported CHAIN_ID=$CHAIN_ID (use 8453 or 84532)" >&2
  exit 1
fi

export BCC_TOKEN_ADDRESS="$BCC"
export ADMIN_ADDRESS="$ADMIN"
export COOLDOWN_PERIOD="$COOLDOWN"

echo "Deploying BccRootsStaking on chain ${CHAIN_ID}..."
forge script script/DeployBccRootsStaking.s.sol:DeployBccRootsStakingScript \
  --rpc-url "$RPC" --broadcast --chain-id "$CHAIN_ID"

node "$ROOT/scripts/write-bcc-from-broadcast.mjs" \
  "$CHAIN_ID" "DeployBccRootsStaking.s.sol" "BccRootsStaking"

node "$ROOT/scripts/sync-bcc-addresses-doc.mjs"
npm run contracts:sdk --prefix "$ROOT"
bash "$ROOT/scripts/sync-vite-env.sh" 2>/dev/null || true

ADDR="$(node -e "
const j=require('$ROOT/contracts/deployments/bcc-$CHAIN_ID.json');
console.log(j.contracts?.BccRootsStaking || '');
")"

echo ""
echo "BccRootsStaking deployed: $ADDR"
echo "Next:"
echo "  1. Set VITE_BCC_ROOTS_STAKING_ADDRESS=$ADDR in deploy/.env"
echo "  2. Set VITE_BCC_ROOTS_ENABLED=1 after counsel approves emission schedule"
echo "  3. Grant REWARD_ROLE on contract to Protocol Safe"
echo ""
echo "Mainnet note: deployer needs ~0.00003 ETH on Base for gas. If broadcast fails with"
echo "insufficient funds, fund 0x2CCf1076A9DCA4d656A156d6036Cc2066c596AF5 and re-run."
