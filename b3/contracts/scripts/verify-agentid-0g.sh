#!/usr/bin/env bash
# Verify AgentId on 0G Chain mainnet (ChainScan).
# Docs: https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CONTRACT="${AGENT_ID_ADDRESS:-0x0451b1d37058ad57df22d7185aabc6b0a36fc41e}"
CHAIN_ID="${OG_CHAIN_ID:-16661}"
SCAN_API="${OG_CHAINSCAN_API_URL:-https://chainscan.0g.ai/open/api}"

# Match DeployAgentId.s.sol defaults used for mainnet deploy.
NAME="${AGENT_ID_NAME:-0G Agent ID}"
SYMBOL="${AGENT_ID_SYMBOL:-AGENTID}"
BASE_URI="${AGENT_ID_BASE_URI:-https://app.buildingculture.capital/0g/agentid/}"
OWNER="${AGENT_ID_OWNER:-}"

if [[ -z "${ETHERSCAN_API_KEY:-}" ]]; then
  echo "Set ETHERSCAN_API_KEY (ChainScan API key from 0G docs) and re-run." >&2
  exit 1
fi

if [[ -z "$OWNER" ]]; then
  echo "Set AGENT_ID_OWNER to the deployer address passed as initialOwner in the constructor." >&2
  exit 1
fi

ENCODED_ARGS="$(cast abi-encode "constructor(string,string,string,address)" "$NAME" "$SYMBOL" "$BASE_URI" "$OWNER")"

echo "Verifying AgentId at $CONTRACT on chain $CHAIN_ID ..."
forge verify-contract \
  "$CONTRACT" \
  src/AgentId.sol:AgentId \
  --chain-id "$CHAIN_ID" \
  --etherscan-api-key "$ETHERSCAN_API_KEY" \
  --verifier-url "$SCAN_API" \
  --constructor-args "$ENCODED_ARGS" \
  --watch

echo "Done. Check: https://chainscan.0g.ai/address/${CONTRACT}#code"
