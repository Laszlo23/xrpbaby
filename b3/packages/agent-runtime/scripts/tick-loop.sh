#!/usr/bin/env sh
# Run agent ticks on an interval (default 900s = 15m). Safe defaults: set AGENTS_PAUSED=1 until verified.
set -eu
INTERVAL_SEC="${AGENT_TICK_INTERVAL_SEC:-900}"
CONFIG="${AGENTS_CONFIG_PATH:-/app/ops/agents.json}"

echo "[agent-runtime] tick-loop interval=${INTERVAL_SEC}s config=${CONFIG}"

while true; do
  node dist/cli/run-tick.js --agent all --config "$CONFIG" || echo "[agent-runtime] tick failed (non-fatal), continuing"
  sleep "$INTERVAL_SEC"
done
