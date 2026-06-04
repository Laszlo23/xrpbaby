#!/usr/bin/env bash
# Start the sugar-sdk trading worker on :8765 (use alongside `cd app && npm run dev`).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="$ROOT/packages/trading-agent"
cd "$PKG"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

# Prefer Alchemy from identity app env when public RPC rate-limits sugar-sdk.
if [[ -z "${SUGAR_RPC_URI_8453:-}" ]] && [[ -f "$ROOT/apps/identity/.env" ]]; then
  KEY="$(grep '^ALCHEMY_API_KEY=' "$ROOT/apps/identity/.env" | cut -d= -f2- || true)"
  if [[ -n "$KEY" ]]; then
    export SUGAR_RPC_URI_8453="https://base-mainnet.g.alchemy.com/v2/${KEY}"
  fi
fi
export SUGAR_RPC_URI_8453="${SUGAR_RPC_URI_8453:-https://mainnet.base.org}"
export PYTHONPATH="$PKG"
export TRADING_AGENT_PORT="${TRADING_AGENT_PORT:-8765}"

echo "Starting trading agent on :${TRADING_AGENT_PORT} (RPC=${SUGAR_RPC_URI_8453:0:50}…)"
exec .venv/bin/python -m trading_agent.server
