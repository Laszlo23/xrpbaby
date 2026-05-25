#!/usr/bin/env bash
# Build apps/eco (workspace), rsync dist to VPS, ensure nginx static SPA, obtain TLS if missing.
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export CERTBOT_EMAIL=you@domain.com   # required first time for Let's Encrypt
#   export PUBLIC_DOMAIN=eco.buildingculture.capital
#   export REMOTE_ROOT=/var/www/eco-buildingculture
#   ./scripts/deploy-eco-buildingculture.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
B3_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
DOMAIN="${PUBLIC_DOMAIN:-eco.buildingculture.capital}"
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/eco-buildingculture}"

cd "$B3_ROOT"
export VITE_ECO_HUB_LANDING_URL="${VITE_ECO_HUB_LANDING_URL:-https://${DOMAIN}}"

echo "==> Install (workspace) + build apps/eco with VITE_ECO_HUB_LANDING_URL=${VITE_ECO_HUB_LANDING_URL}"
npm install --no-audit --no-fund
npm --prefix apps/eco run build

echo "==> Rsync dist → ${HOST}:${REMOTE_ROOT}/"
ssh -o BatchMode=yes "$HOST" "mkdir -p '${REMOTE_ROOT}'"
rsync -az --delete -e "ssh -o BatchMode=yes" "${B3_ROOT}/apps/eco/dist/" "${HOST}:${REMOTE_ROOT}/"

DEPLOY_HOST="$HOST" PUBLIC_DOMAIN="$DOMAIN" REMOTE_ROOT="$REMOTE_ROOT" "$SCRIPT_DIR/install-nginx-eco-static-on-server.sh"

echo "==> TLS (Let's Encrypt via nginx plugin)"
ssh -o BatchMode=yes "$HOST" bash -s -- "$DOMAIN" "${CERTBOT_EMAIL:-}" <<'REMOTE'
set -euo pipefail
DOMAIN="$1"
EMAIL="${2-}"
LE="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

if [[ -f "$LE" ]]; then
  echo "Certificate already present for ${DOMAIN}."
  sudo certbot renew --dry-run 2>/dev/null || true
  exit 0
fi

if [[ -z "${EMAIL}" ]]; then
  echo "error: set CERTBOT_EMAIL for first-time certificate issuance."
  exit 1
fi

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y certbot python3-certbot-nginx
  else
    echo "error: install certbot manually, then re-run this script."
    exit 1
  fi
fi

sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect
REMOTE

echo "==> Deploy finished. Open https://${DOMAIN}/land"
