#!/usr/bin/env bash
# Deploy full stack to Places Hostinger host (srv1161535.hstgr.cloud).
# Requires apps/places/.env.deploy with DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_PASSWORD.
#
# Usage:
#   ./scripts/deploy-full-stack-places.sh
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/apps/places/.env.deploy"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: missing $ENV_FILE"
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

: "${DEPLOY_HOST:?Set DEPLOY_HOST in .env.deploy}"
: "${DEPLOY_USER:?Set DEPLOY_USER in .env.deploy}"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "error: install sshpass (brew install sshpass)"
  exit 1
fi

if [[ -z "${DEPLOY_SSH_PASSWORD:-}" ]]; then
  echo "error: set DEPLOY_SSH_PASSWORD in .env.deploy or use SSH keys on the places host"
  exit 1
fi

export SSHPASS="$DEPLOY_SSH_PASSWORD"
export DEPLOY_HOST="${DEPLOY_USER}@${DEPLOY_HOST}"
export DEPLOY_PATH="${DEPLOY_PATH:-/opt/buildingculture}"
export RSYNC_RSH="sshpass -e ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30"

# Wrap ssh/rsync in deploy-full-stack via SSH_KEY hack: use ProxyCommand with sshpass
export SSH_KEY=""
SSH_WRAP=(sshpass -e ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30)

echo "==> Deploying full stack to $DEPLOY_HOST:$DEPLOY_PATH"
cd "$ROOT"
npm run sync:deploy-env

echo "==> Rsync"
rsync -avz --delete \
  -e "sshpass -e ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30" \
  --exclude '**/node_modules' \
  --exclude '**/.git' \
  --exclude 'app/.env' \
  --exclude 'cms/.tmp' \
  --exclude 'contracts/cache' \
  --exclude 'contracts/out' \
  "$ROOT/" "$DEPLOY_HOST:$DEPLOY_PATH/"

echo "==> Remote build + compose up"
sshpass -e ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 "$DEPLOY_HOST" bash -s -- "$DEPLOY_PATH" <<'REMOTE'
set -euo pipefail
cd "$1/deploy"
test -f .env || { echo "missing deploy/.env on server"; exit 1; }
cp .env ../app/.env
chmod +x ../app/scripts/docker-build.sh
cd ..
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"
./app/scripts/docker-build.sh
cd deploy
docker compose --env-file .env build strapi agent-runtime indexer
docker compose --env-file .env up -d
docker compose ps
REMOTE

echo "==> Done. Configure nginx for 0x.buildingcultureid.space → WEB_HOST_PORT (default 3005 in deploy/.env)"
