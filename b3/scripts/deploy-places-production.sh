#!/usr/bin/env bash
# Build and deploy Places RWA web (Next.js) to production + wire nginx for places.buildingcultureid.space.
#
# Usage (from b3/):
#   DEPLOY_HOST=root@187.124.18.204 DEPLOY_PATH=/opt/buildingculture \
#   SSH_KEY=$HOME/.ssh/id_ed25519_wgsdex PLACES_PORT=3013 ./scripts/deploy-places-production.sh
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_HOST="${DEPLOY_HOST:-root@187.124.18.204}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/buildingculture}"
PLACES_PORT="${PLACES_PORT:-3013}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
RSYNC_SSH="ssh -i $SSH_KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
REMOTE_ROOT="${DEPLOY_PATH}"

echo "==> Sync Places env from base-mainnet.json"
ENV_TMP="$(mktemp)"
{
  python3 apps/places/scripts/sync_web_env.py apps/places/deployments/base-mainnet.json
  echo "NEXT_PUBLIC_SITE_URL=https://places.buildingcultureid.space"
  if [[ -f deploy/.env ]]; then
    # shellcheck disable=SC1091
    set -a && source deploy/.env && set +a
    [[ -n "${VITE_PRIVY_APP_ID:-}" ]] && echo "NEXT_PUBLIC_PRIVY_APP_ID=${VITE_PRIVY_APP_ID}"
    [[ -n "${VITE_PRIVY_CLIENT_ID:-}" ]] && echo "NEXT_PUBLIC_PRIVY_CLIENT_ID=${VITE_PRIVY_CLIENT_ID}"
    [[ -n "${VITE_WALLETCONNECT_PROJECT_ID:-}" ]] && echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${VITE_WALLETCONNECT_PROJECT_ID}"
  fi
} > "$ENV_TMP"

echo "==> Rsync monorepo slice -> ${DEPLOY_HOST}:${REMOTE_ROOT}"
rsync -avz --delete -e "$RSYNC_SSH" \
  --exclude 'node_modules' --exclude '.next' \
  "$ROOT/apps/places/web/" "${DEPLOY_HOST}:${REMOTE_ROOT}/apps/places/web/"
rsync -avz --delete -e "$RSYNC_SSH" \
  --exclude 'node_modules' \
  "$ROOT/packages/bcc-kit/" "${DEPLOY_HOST}:${REMOTE_ROOT}/packages/bcc-kit/"
rsync -avz --delete -e "$RSYNC_SSH" \
  --exclude 'node_modules' \
  "$ROOT/packages/culture-auth/" "${DEPLOY_HOST}:${REMOTE_ROOT}/packages/culture-auth/"
rsync -avz -e "$RSYNC_SSH" \
  "$ROOT/apps/places/data/" "${DEPLOY_HOST}:${REMOTE_ROOT}/apps/places/data/"
rsync -avz -e "$RSYNC_SSH" \
  "$ROOT/apps/places/deployments/" "${DEPLOY_HOST}:${REMOTE_ROOT}/apps/places/deployments/"
scp -i "$SSH_KEY" -o BatchMode=yes "$ROOT/apps/places/Dockerfile.deploy" "${DEPLOY_HOST}:${REMOTE_ROOT}/apps/places/Dockerfile.deploy"
scp -i "$SSH_KEY" -o BatchMode=yes "$ROOT/apps/places/dockerignore.places-build" "${DEPLOY_HOST}:${REMOTE_ROOT}/.dockerignore"
scp -i "$SSH_KEY" -o BatchMode=yes "$ENV_TMP" "${DEPLOY_HOST}:${REMOTE_ROOT}/apps/places/.env"
rm -f "$ENV_TMP"

echo "==> Remote docker build + run (port ${PLACES_PORT})"
ssh -i "$SSH_KEY" -o BatchMode=yes "$DEPLOY_HOST" bash -s -- "$REMOTE_ROOT" "$PLACES_PORT" <<'REMOTE'
set -euo pipefail
ROOT="$1"
PORT="$2"
cd "$ROOT"
export DOCKER_BUILDKIT=1
set -a && source apps/places/.env && set +a
docker build --no-cache -f apps/places/Dockerfile.deploy -t ogchain-web:latest \
  --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://places.buildingcultureid.space}" \
  --build-arg NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:-}" \
  --build-arg NEXT_PUBLIC_BASE_RPC="${NEXT_PUBLIC_BASE_RPC}" \
  --build-arg NEXT_PUBLIC_BASE_EXPLORER="${NEXT_PUBLIC_BASE_EXPLORER}" \
  --build-arg NEXT_PUBLIC_BASE_REGISTRY="${NEXT_PUBLIC_BASE_REGISTRY}" \
  --build-arg NEXT_PUBLIC_BASE_SHARE_FACTORY="${NEXT_PUBLIC_BASE_SHARE_FACTORY}" \
  --build-arg NEXT_PUBLIC_BASE_COMPLIANCE_REGISTRY="${NEXT_PUBLIC_BASE_COMPLIANCE_REGISTRY}" \
  --build-arg NEXT_PUBLIC_BASE_WETH="${NEXT_PUBLIC_BASE_WETH}" \
  --build-arg NEXT_PUBLIC_BASE_ROUTER="${NEXT_PUBLIC_BASE_ROUTER}" \
  --build-arg NEXT_PUBLIC_BASE_LENDING_POOL="${NEXT_PUBLIC_BASE_LENDING_POOL}" \
  --build-arg NEXT_PUBLIC_BASE_PREDICTION_MARKET="${NEXT_PUBLIC_BASE_PREDICTION_MARKET}" \
  --build-arg NEXT_PUBLIC_BASE_PROOF_NFT="${NEXT_PUBLIC_BASE_PROOF_NFT}" \
  --build-arg NEXT_PUBLIC_BASE_STAKING="${NEXT_PUBLIC_BASE_STAKING}" \
  --build-arg NEXT_PUBLIC_BASE_PLATFORM_TOKEN="${NEXT_PUBLIC_BASE_PLATFORM_TOKEN:-0x0000000000000000000000000000000000000000}" \
  --build-arg NEXT_PUBLIC_BASE_PURCHASE_ESCROW_ERC20="${NEXT_PUBLIC_BASE_PURCHASE_ESCROW_ERC20:-0x0000000000000000000000000000000000000000}" \
  --build-arg NEXT_PUBLIC_PRIVY_APP_ID="${NEXT_PUBLIC_PRIVY_APP_ID:-}" \
  --build-arg NEXT_PUBLIC_PRIVY_CLIENT_ID="${NEXT_PUBLIC_PRIVY_CLIENT_ID:-}" \
  .
docker rm -f ogchain-web-1 2>/dev/null || true
docker run -d --name ogchain-web-1 --restart unless-stopped \
  -p "127.0.0.1:${PORT}:3000" \
  --env-file apps/places/.env \
  -e NODE_ENV=production \
  ogchain-web:latest
sleep 4
curl -sI "http://127.0.0.1:${PORT}/marketplace" | head -3
REMOTE

echo "==> Patch nginx: route places.buildingcultureid.space -> 127.0.0.1:${PLACES_PORT}"
ssh -i "$SSH_KEY" -o BatchMode=yes "$DEPLOY_HOST" bash -s -- "$PLACES_PORT" <<'NGINX'
set -euo pipefail
PORT="$1"
CONF="/etc/nginx/sites-available/app.buildingcultureid.space"
python3 - "$CONF" "$PORT" <<'PY'
import sys
from pathlib import Path
conf, port = sys.argv[1], sys.argv[2]
text = Path(conf).read_text()
idx = text.find("server {")
if idx < 0:
    raise SystemExit("no server block in nginx config")
header = f"""upstream bc_unified_app {{
    server 127.0.0.1:3011;
    keepalive 32;
}}

upstream bc_places_app {{
    server 127.0.0.1:{port};
    keepalive 16;
}}

map $host $bc_backend {{
    places.buildingcultureid.space http://bc_places_app;
    default                    http://bc_unified_app;
}}

"""
body = text[idx:]
if "proxy_pass http://bc_unified_app;" in body:
    body = body.replace("proxy_pass http://bc_unified_app;", "proxy_pass $bc_backend;")
Path(conf).write_text(header + body)
print("nginx upstream/map header refreshed")
PY
nginx -t && systemctl reload nginx
NGINX

echo "==> Done. Smoke: curl -sI https://places.buildingcultureid.space/marketplace"
