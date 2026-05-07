#!/usr/bin/env bash
# Static SPA for home.buildingculture.capital — root + try_files → index.html.
# Run after rsync of Vite dist (b3/umbrella) to REMOTE_ROOT.
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export PUBLIC_DOMAIN=home.buildingculture.capital
#   export REMOTE_ROOT=/var/www/home-buildingculture
#   ./scripts/install-nginx-home-on-server.sh
#
set -euo pipefail
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
DOMAIN="${PUBLIC_DOMAIN:-home.buildingculture.capital}"
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/home-buildingculture}"

echo "==> Nginx static SPA on $HOST — ${DOMAIN} → root ${REMOTE_ROOT}"

ssh -o BatchMode=yes "$HOST" bash -s -- "$DOMAIN" "$REMOTE_ROOT" <<'REMOTE'
set -euo pipefail
DOMAIN="$1"
REMOTE_ROOT="$2"

if ! command -v nginx >/dev/null 2>&1; then
  echo "error: nginx not installed. Try: sudo apt install -y nginx"
  exit 1
fi

sudo mkdir -p "$REMOTE_ROOT"

EXIST="/etc/nginx/sites-available/buildingculture-home.conf"

patch_existing_root() {
  local f="$1"
  echo "==> Patching existing $f (root → ${REMOTE_ROOT})"
  sudo sed -i.bak "s|^[[:space:]]*root .*;|    root ${REMOTE_ROOT};|" "$f"
}

if [[ -f "$EXIST" ]] && sudo grep -q "try_files" "$EXIST" 2>/dev/null; then
  patch_existing_root "$EXIST"
  sudo nginx -t
  sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload
  echo "nginx reloaded."
  exit 0
fi

LE="/etc/letsencrypt/live/${DOMAIN}"
HAS_SSL=0
if [[ -f "${LE}/fullchain.pem" && -f "${LE}/privkey.pem" ]]; then
  HAS_SSL=1
fi

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

read -r -d '' common_locations <<'LOC' || true
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
LOC

cat >"$TMP" <<EOF
# b3 install-nginx-home-on-server.sh
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    root ${REMOTE_ROOT};
${common_locations}
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

    root ${REMOTE_ROOT};
${common_locations}
}
EOF
fi

OUT=/etc/nginx/sites-available/buildingculture-home.conf
if [[ -d /etc/nginx/sites-available ]]; then
  sudo cp "$TMP" "$OUT"
  sudo ln -sf "$OUT" /etc/nginx/sites-enabled/buildingculture-home.conf
elif [[ -d /etc/nginx/conf.d ]]; then
  sudo cp "$TMP" /etc/nginx/conf.d/buildingculture-home.conf
else
  echo "error: nginx layout unknown."
  exit 1
fi

sudo nginx -t
sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload
echo "Installed home static site block."
REMOTE

echo "==> Next: rsync dist to ${REMOTE_ROOT} and run certbot if HTTPS is not yet configured."
