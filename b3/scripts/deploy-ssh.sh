#!/usr/bin/env bash
# Sync b3/app to a remote host over SSH, build the image, and start the stack.
#
# Default stack: Postgres 16 + app (see app/docker-compose.stack.yml).
# Required on the server in REMOTE_DIR/app/.env:
#   POSTGRES_PASSWORD=<strong secret>
#   … plus VITE_* / API keys (see app/.env.example)
#
set -euo pipefail
HOST="${DEPLOY_HOST:?set DEPLOY_HOST, e.g. user@203.0.113.10}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/app"
IMAGE="${IMAGE_NAME:-buildingculture-frontend:latest}"
APP_PORT="${APP_PORT:-3010}"
CONTAINER_NAME="${CONTAINER_NAME:-buildingculture-web}"
USE_COMPOSE="${USE_DOCKER_COMPOSE:-1}"
SSH_OPTS=( -o BatchMode=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=240 )

if [[ "$USE_COMPOSE" == "1" ]]; then
  echo "==> Checking $HOST:${REMOTE_DIR}/app/.env for POSTGRES_PASSWORD (compose stack)"
  if ! ssh "${SSH_OPTS[@]}" "$HOST" "test -f '${REMOTE_DIR}/app/.env' && grep -qE '^POSTGRES_PASSWORD=.+' '${REMOTE_DIR}/app/.env'"; then
    echo "error: docker-compose.stack.yml needs a non-empty POSTGRES_PASSWORD in the server .env."
    echo "One-time on the server:"
    echo "  ssh ${HOST} 'cd ${REMOTE_DIR}/app && test -f .env && { grep -q \"^POSTGRES_PASSWORD=\" .env || echo POSTGRES_PASSWORD=\$(openssl rand -hex 24) >> .env; }'"
    exit 1
  fi
fi

echo "==> Rsync b3(app+packages)/ -> $HOST:$REMOTE_DIR/ (compose=${USE_COMPOSE})"
rsync -avz --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude '**/node_modules' \
  --exclude '**/dist' \
  --exclude '**/.git' \
  --exclude 'app/.env' \
  --exclude 'app/docker/dotenv-for-build' \
  --include 'package.json' \
  --include 'package-lock.json' \
  --include 'content/***' \
  --include 'app/***' \
  --include 'packages/***' \
  --exclude '*' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

echo "==> Remote: build image + start"
ssh "${SSH_OPTS[@]}" "$HOST" bash -s -- "$REMOTE_DIR" "$IMAGE" "$APP_PORT" "$CONTAINER_NAME" "${USE_COMPOSE}" "${DOCKER_BUILD_ARGS:-}" <<'REMOTE'
set -euo pipefail
cd "$1"
IMAGE_NAME="$2"
APP_PORT="${3:-3010}"
CNAME="${4:-buildingculture-web}"
USE_COMPOSE="${5:-1}"
DOCKER_BUILD_ARGS="${6:-}"
export IMAGE_NAME APP_PORT

chmod +x app/scripts/docker-build.sh app/scripts/docker-entrypoint.sh 2>/dev/null || true
export DOCKER_BUILD_ARGS
./app/scripts/docker-build.sh

if [[ "$USE_COMPOSE" == "1" ]] && [[ -f app/docker-compose.stack.yml ]]; then
  docker rm -f "$CNAME" 2>/dev/null || true
  export APP_PORT
  docker compose -f app/docker-compose.stack.yml --env-file app/.env down 2>/dev/null || true
  docker compose -f app/docker-compose.stack.yml --env-file app/.env up -d --remove-orphans
else
  [[ -f app/docker-compose.stack.yml ]] && docker compose -f app/docker-compose.stack.yml --env-file app/.env down 2>/dev/null || true
  docker rm -f "$CNAME" 2>/dev/null || true
  docker run -d \
    --name "$CNAME" \
    --restart unless-stopped \
    -p "127.0.0.1:${APP_PORT}:3000" \
    --env-file app/.env \
    "$IMAGE_NAME"
fi
REMOTE

echo "==> Done."
