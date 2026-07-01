#!/usr/bin/env bash
# Patch ALCHEMY_API_KEY + BASE_RPC_URL on remote app/.env from local deploy/.env.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH_OPTS=( -o BatchMode=yes )
[[ -f "$SSH_KEY" ]] && SSH_OPTS=( -i "$SSH_KEY" "${SSH_OPTS[@]}" )

node "$ROOT/scripts/patch-remote-env.mjs" "$ROOT/deploy/.env" | \
  ssh "${SSH_OPTS[@]}" "$HOST" "cd '$REMOTE_DIR' && node"
