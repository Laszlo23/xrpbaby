#!/usr/bin/env bash
# Install GTM nginx configs on production VPS (satellites + phase-6 redirects).
# Skips SSL vhosts until certbot certs exist (DNS must be live first).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@187.124.18.204}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH=(ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes)
SCP=(scp -i "$SSH_KEY" -o IdentitiesOnly=yes)

NGINX_DIR="/etc/nginx/sites-available"
ENABLED="/etc/nginx/sites-enabled"
VPS_IP="${VPS_IP:-187.124.18.204}"

install_conf() {
  local src="$1"
  local dest="$2"
  "${SSH[@]}" "$HOST" "mkdir -p $NGINX_DIR"
  "${SCP[@]}" "$ROOT/infra/$src" "$HOST:$NGINX_DIR/$dest"
  "${SSH[@]}" "$HOST" "ln -sf $NGINX_DIR/$dest $ENABLED/$dest"
}

cert_exists() {
  local cert_name="$1"
  "${SSH[@]}" "$HOST" "test -f /etc/letsencrypt/live/${cert_name}/fullchain.pem"
}

issue_cert() {
  local host="$1"
  echo "==> certbot for $host"
  "${SSH[@]}" "$HOST" \
    "certbot certonly --nginx -d $host --non-interactive --agree-tos -m hello@buildingcultureid.space --keep-until-expiring || true"
}

has_dns() {
  local host="$1"
  dig +short A "$host" 2>/dev/null | grep -q "$VPS_IP"
}

echo "==> Issue TLS certs where DNS resolves"
for host in ankommen.buildingcultureid.space forkids.buildingcultureid.space mini.buildingcultureid.space miniapp.buildingcultureid.space; do
  if has_dns "$host"; then
    issue_cert "$host"
  else
    echo "SKIP cert $host (no A → $VPS_IP — run npm run dns:provision-satellites)"
  fi
done

echo "==> Install satellite nginx configs (SSL required)"
installed=0

if cert_exists "ankommen.buildingcultureid.space"; then
  install_conf "nginx-ankommen-native.example.conf" "ankommen.buildingcultureid.space.conf"
  echo "OK   ankommen.buildingcultureid.space.conf"
  installed=$((installed + 1))
else
  echo "SKIP ankommen (no cert)"
fi

if cert_exists "forkids.buildingcultureid.space"; then
  install_conf "nginx-forkids-native.example.conf" "forkids.buildingcultureid.space.conf"
  echo "OK   forkids.buildingcultureid.space.conf"
  installed=$((installed + 1))
else
  echo "SKIP forkids (no cert)"
fi

echo "==> Phase-6 redirects"
if cert_exists "miniapp.buildingcultureid.space" || cert_exists "buildingcultureid.space"; then
  install_conf "nginx-phase6-redirects.example.conf" "bc-phase6-redirects.conf"
  echo "OK   bc-phase6-redirects.conf"
else
  echo "SKIP phase6 (certs missing)"
fi

if [[ "$installed" -eq 0 ]]; then
  echo ""
  echo "No satellite SSL configs installed. Add DNS A records, then re-run."
fi

echo "==> nginx test + reload"
if ! "${SSH[@]}" "$HOST" "nginx -t"; then
  echo "error: nginx -t failed — rolling back"
  "${SSH[@]}" "$HOST" "rm -f $ENABLED/ankommen.buildingcultureid.space.conf $ENABLED/forkids.buildingcultureid.space.conf $ENABLED/bc-phase6-redirects.conf && nginx -t && systemctl reload nginx"
  exit 1
fi
"${SSH[@]}" "$HOST" "systemctl reload nginx"
echo "Done."
