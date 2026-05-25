#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example to .env and set PRIVATE_KEY." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

: "${PRIVATE_KEY:?Set PRIVATE_KEY in .env}"
: "${PROPERTY_REGISTRY:?Set PROPERTY_REGISTRY in .env}"
: "${PROPERTY_SHARE_FACTORY:?Set PROPERTY_SHARE_FACTORY in .env}"

forge script script/SeedFourMoreProperties.s.sol:SeedFourMorePropertiesScript \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --broadcast
