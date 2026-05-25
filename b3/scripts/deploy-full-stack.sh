#!/usr/bin/env bash
# Sync b3/ to a VPS and start the full Phase-1 stack (Postgres + Strapi + web + agent + indexer).
#
# Usage:
#   export DEPLOY_HOST=user@203.0.113.10
#   export DEPLOY_PATH=/opt/buildingculture   # optional
#   cp deploy/.env.example deploy/.env && edit secrets
#   ./scripts/sync-deploy-env.sh
#   ./scripts/deploy-full-stack.sh
#
set -euo pipefail
HOST="${DEPLOY_HOST:?set DEPLOY_HOST, e.g. user@203.0.113.10}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/buildingculture}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_OPTS=( -o BatchMode=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=240 )

if [[ ! -f "$ROOT/deploy/.env" ]]; then
  echo "error: create $ROOT/deploy/.env from deploy/.env.example first"
  exit 1
fi

echo "==> Sync deploy/.env → app/.env for Vite build"
"$ROOT/scripts/sync-deploy-env.sh"

echo "==> Rsync b3/ -> $HOST:$REMOTE_DIR/"
rsync -avz --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude '**/node_modules' \
  --exclude '**/.git' \
  --exclude 'app/.env' \
  --exclude 'cms/.tmp' \
  --exclude 'contracts/cache' \
  --exclude 'contracts/out' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

echo "==> Remote: build images + docker compose up"
ssh "${SSH_OPTS[@]}" "$HOST" bash -s -- "$REMOTE_DIR" <<'REMOTE'
set -euo pipefail
cd "$1/deploy"
test -f .env || { echo "missing deploy/.env on server"; exit 1; }
cp .env ../app/.env
chmod +x ../app/scripts/docker-build.sh
cd ..
./app/scripts/docker-build.sh
cd deploy
docker compose --env-file .env build strapi agent-runtime indexer
docker compose --env-file .env up -d
docker compose ps
echo ""
echo "Next: create Strapi admin at http://127.0.0.1:1337/admin (via SSH tunnel)"
echo "      docker compose exec strapi sh -c 'cd /app && npm run ensure:local -w buildingculture-strapi' || true"
echo "      nginx: see infra/nginx-unified-entry.example.conf + api upstream on :1337"
REMOTE

echo "==> Done. SSH tunnel: ssh -L 3000:127.0.0.1:3000 -L 1337:127.0.0.1:1337 $HOST"
