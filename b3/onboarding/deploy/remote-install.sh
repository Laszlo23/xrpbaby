#!/usr/bin/env bash
set -euo pipefail

DOMAIN="app.buildingcultureid.space"
APP_ROOT="/var/www/app-buildingcultureid"
OPT_ROOT="/opt/buildingculture-landing"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
API_PORT=8020

echo "==> Directories"
mkdir -p "$APP_ROOT" "$OPT_ROOT/backend" /var/www/certbot

echo "==> MongoDB (Docker)"
if ! docker ps --format '{{.Names}}' | grep -q '^buildingculture-landing-mongo$'; then
  docker compose -f "$OPT_ROOT/docker-compose.yml" up -d
  sleep 3
fi

echo "==> Python venv support"
if ! python3 -m venv /tmp/_bc_venv_test 2>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq python3.12-venv
fi
rm -rf /tmp/_bc_venv_test

echo "==> Backend venv + deps"
cd "$OPT_ROOT/backend"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

if [[ ! -f .env ]]; then
  cat > .env <<EOF
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=buildingculture_landing
CORS_ORIGINS=https://${DOMAIN}
EOF
fi

echo "==> systemd API"
cp "$OPT_ROOT/buildingculture-landing-api.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable buildingculture-landing-api.service
systemctl restart buildingculture-landing-api.service

echo "==> nginx (HTTP only first)"
cp "$OPT_ROOT/nginx/${DOMAIN}.conf" "$NGINX_SITE"
ln -sf "$NGINX_SITE" "/etc/nginx/sites-enabled/${DOMAIN}"

# Temporary HTTP-only config for certbot if certs missing
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    root ${APP_ROOT};
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
  nginx -t && systemctl reload nginx

  echo "==> certbot SSL"
  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email || \
  certbot certonly --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email

  cp "$OPT_ROOT/nginx/${DOMAIN}.conf" "$NGINX_SITE"
fi

nginx -t && systemctl reload nginx

echo "==> Health"
sleep 2
curl -fsS "http://127.0.0.1:${API_PORT}/api/" | head -c 200
echo ""
curl -fsSI "https://${DOMAIN}/" | head -5 || curl -fsSI "http://${DOMAIN}/" | head -5

echo "Done: https://${DOMAIN}"
