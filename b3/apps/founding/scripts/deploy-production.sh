#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH_HOST="${SSH_HOST:-root@187.124.18.204}"
REMOTE_OPT="/opt/founding-builders"
REMOTE_WWW="/var/www/miniapp-buildingcultureid"
API_PORT="${API_PORT:-8022}"
DOMAIN="miniapp.buildingcultureid.space"

RSYNC_SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new"

echo "==> Building Expo web (static) for $DOMAIN"
cd "$ROOT/frontend"
EXPO_PUBLIC_BACKEND_URL="https://${DOMAIN}" npx expo export -p web

echo "==> Syncing backend to $SSH_HOST:$REMOTE_OPT/backend"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $REMOTE_OPT/backend"
rsync -az --delete \
  --exclude '.venv' \
  --exclude '__pycache__' \
  --exclude '.env' \
  -e "$RSYNC_SSH" \
  "$ROOT/backend/" "$SSH_HOST:$REMOTE_OPT/backend/"

echo "==> Syncing frontend dist to $SSH_HOST:$REMOTE_WWW"
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $REMOTE_WWW"
rsync -az --delete -e "$RSYNC_SSH" "$ROOT/frontend/dist/" "$SSH_HOST:$REMOTE_WWW/"

echo "==> Remote install: venv, systemd, nginx, restart"
ssh -i "$SSH_KEY" "$SSH_HOST" "bash -s" <<REMOTE
set -euo pipefail
REMOTE_OPT="$REMOTE_OPT"
REMOTE_WWW="$REMOTE_WWW"
API_PORT="$API_PORT"
DOMAIN="$DOMAIN"

if [ ! -f "\$REMOTE_OPT/backend/.env" ]; then
  echo "ERROR: \$REMOTE_OPT/backend/.env missing on server. Create it before deploy."
  exit 1
fi

cd "\$REMOTE_OPT/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

cat > /etc/systemd/system/founding-builders-api.service <<UNIT
[Unit]
Description=Founding Builders API (\$DOMAIN)
After=network.target docker.service

[Service]
Type=simple
User=root
WorkingDirectory=\$REMOTE_OPT/backend
EnvironmentFile=\$REMOTE_OPT/backend/.env
ExecStart=\$REMOTE_OPT/backend/.venv/bin/uvicorn server:app --host 127.0.0.1 --port \$API_PORT
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable founding-builders-api.service
systemctl restart founding-builders-api.service

chown -R www-data:www-data "\$REMOTE_WWW"

cat > /etc/nginx/sites-available/founding-builders-miniapp <<'NGINX'
# HTTP — ACME + redirect
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS — static Expo app + API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 10m;
    root WWW_PLACEHOLDER;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:API_PORT_PLACEHOLDER/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)\$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
NGINX

sed -i "s|DOMAIN_PLACEHOLDER|\$DOMAIN|g" /etc/nginx/sites-available/founding-builders-miniapp
sed -i "s|WWW_PLACEHOLDER|\$REMOTE_WWW|g" /etc/nginx/sites-available/founding-builders-miniapp
sed -i "s|API_PORT_PLACEHOLDER|\$API_PORT|g" /etc/nginx/sites-available/founding-builders-miniapp

ln -sf /etc/nginx/sites-available/founding-builders-miniapp /etc/nginx/sites-enabled/founding-builders-miniapp

if [ ! -f "/etc/letsencrypt/live/\$DOMAIN/fullchain.pem" ]; then
  certbot certonly --webroot -w /var/www/certbot -d "\$DOMAIN" --non-interactive --agree-tos -m admin@buildingcultureid.space || true
fi

nginx -t
systemctl reload nginx

sleep 2
curl -fsS "http://127.0.0.1:\$API_PORT/api/countdown" | head -c 120
echo ""
REMOTE

echo "==> Deploy complete: https://${DOMAIN}"
