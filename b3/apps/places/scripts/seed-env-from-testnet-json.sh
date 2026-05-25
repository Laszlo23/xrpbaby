#!/usr/bin/env bash
# shellcheck source=/dev/null
# Usage (from repo root): source scripts/seed-env-from-testnet-json.sh
# Then: forge script script/SeedThreeProperties.s.sol:SeedThreePropertiesScript --rpc-url https://evmrpc-testnet.0g.ai --broadcast
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JSON="${ROOT}/deployments/testnet.json"
if [[ ! -f "$JSON" ]]; then
  echo "Missing $JSON — copy from testnet.example.json and fill addresses." >&2
  exit 1
fi
PROPERTY_REGISTRY="$(python3 -c "import json;print(json.load(open('$JSON'))['contracts']['PropertyRegistry'])")"
PROPERTY_SHARE_FACTORY="$(python3 -c "import json;print(json.load(open('$JSON'))['contracts']['PropertyShareFactory'])")"
export PROPERTY_REGISTRY PROPERTY_SHARE_FACTORY
echo "PROPERTY_REGISTRY=$PROPERTY_REGISTRY"
echo "PROPERTY_SHARE_FACTORY=$PROPERTY_SHARE_FACTORY"
echo "Also run: export PRIVATE_KEY=0x<your_key>   (paste your real hex key; no extra words on the line)"
