#!/usr/bin/env bash
# Deploy PlatformSettlementToken + PurchaseEscrowERC20 on Base in ONE forge broadcast (avoids nonce collisions).
#
# Prerequisites:
#   - forge (Foundry)
#   - Repo root .env with PRIVATE_KEY
#   - PLATFORM_TOKEN_RECEIVER (multisig / treasury for full supply mint)
#
# Optional env:
#   BASE_RPC_URL          default https://mainnet.base.org
#   PLATFORM_TOKEN_NAME   default "Building Culture"
#   PLATFORM_TOKEN_SYMBOL default "BCULT"
#   PLATFORM_TOKEN_INITIAL_SUPPLY_WEI  default 1e27 (1B tokens * 1e18)
#   BROADCAST             default "1" — pass BROADCAST=0 to simulate only (omit --broadcast)
#
# After broadcast, merge addresses into deployments/base-mainnet.json:
#   python3 scripts/merge_settlement_from_broadcast.py --write deployments/base-mainnet.json
# Then:
#   python3 scripts/sync_web_env.py deployments/base-mainnet.json >> web/.env.local
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

set -a
if [[ -f "$ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env"
fi
set +a

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "error: PRIVATE_KEY must be set (repo .env or environment)" >&2
  exit 1
fi

if [[ -z "${PLATFORM_TOKEN_RECEIVER:-}" ]]; then
  echo "error: PLATFORM_TOKEN_RECEIVER must be set (e.g. Base Safe address)" >&2
  exit 1
fi

REGISTRY="$(python3 -c "import json; print(json.load(open('deployments/base-mainnet.json'))['contracts']['PropertyRegistry'])")"
export PROPERTY_REGISTRY="$REGISTRY"

export PLATFORM_TOKEN_NAME="${PLATFORM_TOKEN_NAME:-Building Culture}"
export PLATFORM_TOKEN_SYMBOL="${PLATFORM_TOKEN_SYMBOL:-BCULT}"
export PLATFORM_TOKEN_INITIAL_SUPPLY_WEI="${PLATFORM_TOKEN_INITIAL_SUPPLY_WEI:-1000000000000000000000000000}"

BFLAGS=()
if [[ "${BROADCAST:-1}" == "1" ]]; then
  BFLAGS+=(--broadcast)
fi

echo "Using RPC: $RPC"
echo "PropertyRegistry: $REGISTRY"
echo "Token receiver: $PLATFORM_TOKEN_RECEIVER"
echo ""

echo "=== DeploySettlementBundle (token + escrow, single broadcast) ==="
forge script script/DeploySettlementBundle.s.sol:DeploySettlementBundleScript \
  --rpc-url "$RPC" \
  "${BFLAGS[@]}"

echo ""
echo "Done. To merge addresses into deployments/base-mainnet.json:"
echo "  python3 scripts/merge_settlement_from_broadcast.py --write deployments/base-mainnet.json"
echo "Then refresh web env:"
echo "  python3 scripts/sync_web_env.py deployments/base-mainnet.json >> web/.env.local"
