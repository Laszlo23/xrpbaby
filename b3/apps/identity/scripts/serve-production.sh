#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3000}"

if [[ -f "$ROOT/deploy/.env.production" ]]; then
  cp "$ROOT/deploy/.env.production" "$ROOT/dist/server/.dev.vars"
fi

export HOME="${HOME:-$ROOT}"
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$ROOT/.config}"
mkdir -p "$XDG_CONFIG_HOME"

cd "$ROOT/dist/server"
if [[ -d "$ROOT/migrations" ]]; then
  mkdir -p ./migrations
  cp -r "$ROOT/migrations/"* ./migrations/ 2>/dev/null || true
  wrangler d1 migrations apply culture-layer-mini --local 2>/dev/null || true
fi
export WRANGLER_SEND_METRICS=false
exec wrangler dev --local --ip "$HOST" --port "$PORT"
