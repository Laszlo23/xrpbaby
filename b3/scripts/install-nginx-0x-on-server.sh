#!/usr/bin/env bash
# Ensure nginx proxies PUBLIC_DOMAIN → 127.0.0.1:APP_PORT (default 0x subdomain → 3010).
# If /etc/nginx/sites-available/0x.buildingculture.capital already exists (Certbot), only
# updates proxy_pass port inside it. Otherwise writes sites-available/buildingculture-0x.conf.
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export APP_PORT=3010
#   export PUBLIC_DOMAIN=0x.buildingculture.capital
#   ./scripts/install-nginx-0x-on-server.sh
#
set -euo pipefail
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
APP_PORT="${APP_PORT:-3010}"
DOMAIN="${PUBLIC_DOMAIN:-0x.buildingculture.capital}"

echo "==> Nginx on $HOST — ${DOMAIN} → 127.0.0.1:${APP_PORT}"

ssh -o BatchMode=yes "$HOST" bash -s -- "$APP_PORT" "$DOMAIN" <<'REMOTE'
set -euo pipefail
APP_PORT="$1"
DOMAIN="$2"

if ! command -v nginx >/dev/null 2>&1; then
  echo "error: nginx not installed. Try: sudo apt install -y nginx"
  exit 1
fi

CERTBOT_NAME="${DOMAIN}"
EXIST="/etc/nginx/sites-available/${CERTBOT_NAME}"

patch_existing() {
  local f="$1"
  echo "==> Patching existing $f (proxy_pass → 127.0.0.1:${APP_PORT})"
  sudo sed -i.bak "s|proxy_pass http://127.0.0.1:[0-9]*;|proxy_pass http://127.0.0.1:${APP_PORT};|g" "$f"
}

if [[ -f "$EXIST" ]]; then
  patch_existing "$EXIST"
  sudo nginx -t
  sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload
  echo "nginx reloaded."
  curl -sS -o /dev/null -w "curl Host:${DOMAIN} → %{http_code}\n" -H "Host: ${DOMAIN}" -k https://127.0.0.1/ 2>/dev/null || \
    curl -sS -o /dev/null -w "curl Host:${DOMAIN} → %{http_code}\n" -H "Host: ${DOMAIN}" http://127.0.0.1/ || true
  exit 0
fi

LE="/etc/letsencrypt/live/${DOMAIN}"
HAS_SSL=0
if [[ -f "${LE}/fullchain.pem" && -f "${LE}/privkey.pem" ]]; then
  HAS_SSL=1
fi

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

cat >"$TMP" <<EOF
# b3 install-nginx-0x-on-server.sh
upstream buildingculture_0x_upstream {
    server 127.0.0.1:${APP_PORT};
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://buildingculture_0x_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_buffering off;
    }
}
EOF

if [[ "$HAS_SSL" == "1" ]]; then
  cat >>"$TMP" <<EOF

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate ${LE}/fullchain.pem;
    ssl_certificate_key ${LE}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    location / {
        proxy_pass http://buildingculture_0x_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_buffering off;
    }
}
EOF
fi

if [[ -d /etc/nginx/sites-available ]]; then
  OUT=/etc/nginx/sites-available/buildingculture-0x.conf
  sudo cp "$TMP" "$OUT"
  sudo ln -sf "$OUT" /etc/nginx/sites-enabled/buildingculture-0x.conf
elif [[ -d /etc/nginx/conf.d ]]; then
  sudo cp "$TMP" /etc/nginx/conf.d/buildingculture-0x.conf
else
  echo "error: nginx layout unknown."
  exit 1
fi

sudo nginx -t
sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload
echo "Installed new site block."
REMOTE

echo "==> If you still see 502: start the app — docker compose must listen on 127.0.0.1:${APP_PORT}"
