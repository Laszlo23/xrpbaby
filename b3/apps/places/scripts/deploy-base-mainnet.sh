#!/usr/bin/env bash
# Deploy the full stack from script/DeployAll.s.sol to Base mainnet (chain id 8453).
#
# Prerequisites:
#   - Repo root `.env` with PRIVATE_KEY for the deployer (foundry.toml has dotenv = true).
#   - That address holds enough ETH on Base for gas (deploy is many contracts).
#   - NFT_BASE_URI: public HTTPS URL ending with / for PropertyShareProof metadata (e.g. your Next.js /api/nft/).
#
# Do not set KYC_BYPASS_ON_DEPLOY on mainnet unless you intentionally want open compliance bypass.
#
# Usage (from repo root):
#   export NFT_BASE_URI=https://your.domain/api/nft/
#   ./scripts/deploy-base-mainnet.sh
#
# Optional:
#   BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/...   # if public RPC rate-limits

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]] && [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "Missing PRIVATE_KEY: add repo root .env with PRIVATE_KEY=0x... or export PRIVATE_KEY before running."
  exit 1
fi

if [[ -z "${NFT_BASE_URI:-}" ]]; then
  echo "Set NFT_BASE_URI to your public proof-NFT metadata base (must be https and end with /), e.g.:"
  echo "  export NFT_BASE_URI=https://buildingculture.capital/api/nft/"
  exit 1
fi

RPC="${BASE_RPC_URL:-https://mainnet.base.org}"

if [[ "${KYC_BYPASS_ON_DEPLOY:-}" == "1" ]] || [[ "${KYC_BYPASS_ON_DEPLOY:-}" == "true" ]]; then
  echo "WARNING: KYC_BYPASS_ON_DEPLOY is enabled — ComplianceRegistry will allow bypass. Usually unsafe on mainnet."
fi

echo "RPC: $RPC"
echo "Deployer (from PRIVATE_KEY) will broadcast. Press Ctrl+C within 5s to abort."
sleep 5

# --slow: public RPCs often reject bursts ("in-flight transaction limit"); wait for each receipt before the next tx.
forge script script/DeployAll.s.sol:DeployAllScript \
  --rpc-url "$RPC" \
  --broadcast \
  --slow \
  -vvv

echo ""
echo "Next: copy console addresses (or broadcast/DeployAll.s.sol/8453/run-latest.json) into deployments/base-mainnet.json, then:"
echo "  python3 scripts/sync_web_env.py deployments/base-mainnet.json >> web/.env.local"
