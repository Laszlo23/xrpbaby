#!/usr/bin/env bash
set -euo pipefail

# Deploy Culture Layer to VPS (buildingcultureid.space)
# Usage: ./deploy/deploy.sh

SSH_HOST="${SSH_HOST:-root@187.124.18.204}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
REMOTE_DIR="/var/www/buildingcultureid"
DOMAIN="buildingcultureid.space"
MINI_DOMAIN="mini.buildingcultureid.space"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building app at $ROOT"
cd "$ROOT"
npm run build

if [[ ! -f "$ROOT/deploy/.env.production" ]]; then
  echo "ERROR: Create deploy/.env.production with NEYNAR_API_KEY and ALCHEMY_API_KEY"
  echo "       (copy from deploy/.env.production.example)"
  exit 1
fi

echo "==> Syncing to $SSH_HOST:$REMOTE_DIR"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $REMOTE_DIR /var/www/certbot"

rsync -avz --delete \
  -e "ssh -i $SSH_KEY" \
  --exclude node_modules \
  --exclude .git \
  --exclude contracts \
  --exclude .wrangler \
  --exclude '.env' \
  "$ROOT/dist" \
  "$ROOT/public" \
  "$ROOT/package.json" \
  "$ROOT/package-lock.json" \
  "$ROOT/scripts/" \
  "$ROOT/deploy" \
  "$ROOT/migrations" \
  "$ROOT/wrangler.jsonc" \
  "$SSH_HOST:$REMOTE_DIR/"

echo "==> Installing dependencies & configuring server"
ssh -i "$SSH_KEY" "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail
REMOTE_DIR="$REMOTE_DIR"
DOMAIN="$DOMAIN"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx curl

if ! command -v node >/dev/null || [[ "\$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi

if ! command -v node >/dev/null || [[ "\$(node -v | tr -d v | cut -d. -f1)" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
npm install -g wrangler@4.92.0 --no-fund --no-audit

cd "\$REMOTE_DIR"
mkdir -p scripts
chmod +x scripts/serve-production.sh 2>/dev/null || chmod +x serve-production.sh 2>/dev/null || true
if [[ -f serve-production.sh ]] && [[ ! -f scripts/serve-production.sh ]]; then
  mv serve-production.sh scripts/serve-production.sh
fi
chmod +x scripts/serve-production.sh
if ! grep -q NEYNAR_SNAPCHAIN_URL deploy/.env.production 2>/dev/null; then
  echo 'NEYNAR_SNAPCHAIN_URL=https://snapchain-api.neynar.com/v1' >> deploy/.env.production
fi

chown -R www-data:www-data "\$REMOTE_DIR"

cp "\$REMOTE_DIR/deploy/buildingcultureid.service" /etc/systemd/system/buildingcultureid.service
systemctl daemon-reload
systemctl enable buildingcultureid
systemctl restart buildingcultureid

cp "\$REMOTE_DIR/deploy/nginx-buildingcultureid-http.conf" /etc/nginx/sites-available/buildingcultureid
ln -sf /etc/nginx/sites-available/buildingcultureid /etc/nginx/sites-enabled/buildingcultureid
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t
systemctl reload nginx

if [[ ! -f "/etc/letsencrypt/live/\$DOMAIN/fullchain.pem" ]]; then
  certbot --nginx -d "\$DOMAIN" -d "www.\$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email --redirect || true
fi

if [[ -f "/etc/letsencrypt/live/\$DOMAIN/fullchain.pem" ]] && [[ -f "\$REMOTE_DIR/deploy/nginx-buildingcultureid.conf" ]]; then
  cp "\$REMOTE_DIR/deploy/nginx-buildingcultureid.conf" /etc/nginx/sites-available/buildingcultureid
  nginx -t && systemctl reload nginx
fi

if [[ -f "\$REMOTE_DIR/deploy/nginx-mini.conf" ]]; then
  cp "\$REMOTE_DIR/deploy/nginx-mini.conf" /etc/nginx/sites-available/buildingcultureid-mini
  ln -sf /etc/nginx/sites-available/buildingcultureid-mini /etc/nginx/sites-enabled/buildingcultureid-mini
  nginx -t && systemctl reload nginx
fi

if [[ ! -f "/etc/letsencrypt/live/mini.buildingcultureid.space/fullchain.pem" ]]; then
  certbot --nginx -d "mini.buildingcultureid.space" \
    --non-interactive --agree-tos --register-unsafely-without-email --redirect 2>/dev/null || true
fi

cd "\$REMOTE_DIR/dist/server"
if [[ -d ../../migrations ]]; then
  cp -r ../../migrations . 2>/dev/null || cp -r "\$REMOTE_DIR/migrations" ./migrations 2>/dev/null || true
fi
wrangler d1 migrations apply culture-layer-mini --local 2>/dev/null || true

echo "==> Deploy complete"
systemctl --no-pager status buildingcultureid | head -15
REMOTE

echo "Done. Site should be live at https://$DOMAIN"
