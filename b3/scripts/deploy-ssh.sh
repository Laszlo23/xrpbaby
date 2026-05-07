#!/usr/bin/env bash
# Sync b3/frontend to a remote host over SSH, build the image, and start the stack.
#
# Default stack: Postgres 16 + app (see frontend/docker-compose.stack.yml).
# Required on the server in REMOTE_DIR/.env:
#   POSTGRES_PASSWORD=<strong secret>
#   … plus VITE_* / API keys (see frontend/.env.example)
#
# Prereqs: Docker + compose plugin on the server; SSH key auth.
# Long remote builds can drop SSH — run this from a stable link, or on the server
# inside tmux/screen, or: ssh user@host 'cd $DEPLOY_PATH && ./scripts/docker-build.sh && ...'
#   export DEPLOY_HOST="user@your.server.ip"
#   export DEPLOY_PATH="/opt/buildingculture-frontend"   # optional
#
# Legacy single-container deploy (no Postgres): export USE_DOCKER_COMPOSE=0
#
set -euo pipefail
HOST="${DEPLOY_HOST:?set DEPLOY_HOST, e.g. user@203.0.113.10}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
IMAGE="${IMAGE_NAME:-buildingculture-frontend:latest}"
APP_PORT="${APP_PORT:-3010}"
CONTAINER_NAME="${CONTAINER_NAME:-buildingculture-web}"
USE_COMPOSE="${USE_DOCKER_COMPOSE:-1}"
# Keep long Docker builds from killing the session (chown / npm can run silent for many minutes).
SSH_OPTS=( -o BatchMode=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=240 )

if [[ "$USE_COMPOSE" == "1" ]]; then
  echo "==> Checking $HOST:${REMOTE_DIR}/.env for POSTGRES_PASSWORD (compose stack)"
  if ! ssh "${SSH_OPTS[@]}" "$HOST" "test -f '${REMOTE_DIR}/.env' && grep -qE '^POSTGRES_PASSWORD=.+' '${REMOTE_DIR}/.env'"; then
    echo "error: docker-compose.stack.yml needs a non-empty POSTGRES_PASSWORD in the server .env."
    echo "One-time on the server (generates secret there):"
    echo "  ssh ${HOST} 'cd ${REMOTE_DIR} && test -f .env && { grep -q \"^POSTGRES_PASSWORD=\" .env || echo POSTGRES_PASSWORD=\$(openssl rand -hex 24) >> .env; }'"
    echo "Or set USE_DOCKER_COMPOSE=0 and provide DATABASE_URL for external Postgres."
    exit 1
  fi
fi

echo "==> Rsync $FRONTEND/ -> $HOST:$REMOTE_DIR/ (compose=${USE_COMPOSE})"
# Never overwrite the server .env — local dev .env often lacks POSTGRES_PASSWORD and
# would replace production secrets (compose then fails with "required variable ... missing").
rsync -avz --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude .env \
  --exclude 'docker/dotenv-for-build' \
  "$FRONTEND/" "$HOST:$REMOTE_DIR/"

echo "==> Remote: build image + start (USE_DOCKER_COMPOSE=${USE_DOCKER_COMPOSE:-1})"
ssh "${SSH_OPTS[@]}" "$HOST" bash -s -- "$REMOTE_DIR" "$IMAGE" "$APP_PORT" "$CONTAINER_NAME" "${USE_COMPOSE}" <<'REMOTE'
set -euo pipefail
cd "$1"
IMAGE_NAME="$2"
APP_PORT="${3:-3010}"
CNAME="${4:-buildingculture-web}"
USE_COMPOSE="${5:-1}"
export IMAGE_NAME APP_PORT

chmod +x scripts/docker-build.sh scripts/docker-entrypoint.sh 2>/dev/null || true
./scripts/docker-build.sh

if [[ "$USE_COMPOSE" == "1" ]] && [[ -f docker-compose.stack.yml ]]; then
  docker rm -f "$CNAME" 2>/dev/null || true
  export APP_PORT
  # Same directory as docker-compose.stack.yml must contain .env with POSTGRES_PASSWORD, VITE_*, etc.
  docker compose -f docker-compose.stack.yml down 2>/dev/null || true
  docker compose -f docker-compose.stack.yml up -d --remove-orphans
  echo "Stack: postgres + web. App on 127.0.0.1:${APP_PORT} → container :3000. Point nginx/Caddy here."
else
  [[ -f docker-compose.stack.yml ]] && docker compose -f docker-compose.stack.yml down 2>/dev/null || true
  docker rm -f "$CNAME" 2>/dev/null || true
  docker run -d \
    --name "$CNAME" \
    --restart unless-stopped \
    -p "127.0.0.1:${APP_PORT}:3000" \
    --env-file .env \
    "$IMAGE_NAME"
  echo "Single container $CNAME on 127.0.0.1:${APP_PORT}. Set DATABASE_URL in .env if using external Postgres."
fi
REMOTE

echo "==> Done. Test: curl -I http://$HOST:$APP_PORT/  (or via domain after TLS)"
