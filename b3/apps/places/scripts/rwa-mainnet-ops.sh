#!/usr/bin/env bash
# Complete RWA mainnet ops after catalog + REOC API are deployed.
# Requires: apps/places/.env with PRIVATE_KEY; deployer funded on Base (~0.05 ETH recommended).
set -euo pipefail
cd "$(dirname "$0")/.."
RPC="${BASE_RPC_URL:-https://mainnet.base.org}"
export PROPERTY_REGISTRY="${PROPERTY_REGISTRY:-0x5aca19274B17B97e38da9eA851d91F0CC59DafBf}"
export PROPERTY_SHARE_FACTORY="${PROPERTY_SHARE_FACTORY:-0x4CA708ca735bBA49D7B2383071EA7FA1B7BDC614}"
export COMPLIANCE_REGISTRY="${COMPLIANCE_REGISTRY:-0xa655c0B0037699433F0692356a3A142956103B7a}"

echo "== Preflight =="
cast call "$PROPERTY_REGISTRY" "nextPropertyId()(uint256)" --rpc-url "$RPC"
cast call "$COMPLIANCE_REGISTRY" "kycBypass()(bool)" --rpc-url "$RPC"

echo "== 1. OG8 share token (if missing) =="
forge script script/CreatePropertyEightShare.s.sol:CreatePropertyEightShareScript \
  --rpc-url "$RPC" --broadcast --slow

echo "== 2. Chainlink modules =="
forge script script/DeployChainlinkModules.s.sol:DeployChainlinkModulesScript \
  --rpc-url "$RPC" --broadcast --slow

echo "== 3. Update REOC metadata URIs on share tokens =="
forge script script/UpdatePropertyShareMetadataURIs.s.sol:UpdatePropertyShareMetadataURIsScript \
  --rpc-url "$RPC" --broadcast --slow

echo "== 4. PoR caps (set PROPERTY_RESERVE_FEED from step 2 log) =="
if [[ -z "${PROPERTY_RESERVE_FEED:-}" ]]; then
  echo "Set PROPERTY_RESERVE_FEED then re-run: forge script script/SetPropertyReserveCaps.s.sol ..."
else
  forge script script/SetPropertyReserveCaps.s.sol:SetPropertyReserveCapsScript \
    --rpc-url "$RPC" --broadcast --slow
fi

echo "== 5. Disable KYC bypass =="
forge script script/SetKycBypassOff.s.sol:SetKycBypassOffScript \
  --rpc-url "$RPC" --broadcast --slow

echo "Done. Update deployments/base-mainnet.json with new addresses and OG8 token."
