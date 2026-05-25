#!/usr/bin/env bash
# Deploy landing page to app.buildingcultureid.space
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_OPTS=(-i "$HOME/.ssh/id_ed25519_wgsdex" -o IdentitiesOnly=yes)
SERVER="root@187.124.18.204"
DOMAIN="https://app.buildingcultureid.space"

echo "==> Build frontend ($DOMAIN)"
cd "$ROOT/frontend"
REACT_APP_BACKEND_URL="$DOMAIN" npm run build

echo "==> Upload static files"
rsync -avz --delete -e "ssh ${SSH_OPTS[*]}" \
  "$ROOT/frontend/build/" \
  "$SERVER:/var/www/app-buildingcultureid/"

echo "==> Upload backend"
ssh "${SSH_OPTS[@]}" "$SERVER" "mkdir -p /opt/buildingculture-landing/backend"
rsync -avz -e "ssh ${SSH_OPTS[*]}" \
  --exclude '.venv' --exclude '__pycache__' --exclude 'tests' \
  "$ROOT/backend/" \
  "$SERVER:/opt/buildingculture-landing/backend/"

echo "==> Restart API"
ssh "${SSH_OPTS[@]}" "$SERVER" \
  "cd /opt/buildingculture-landing/backend && .venv/bin/pip install -q -r requirements.txt && systemctl restart buildingculture-landing-api && chown -R www-data:www-data /var/www/app-buildingcultureid"

echo "==> Smoke test"
curl -fsS "$DOMAIN/api/" >/dev/null
curl -fsSI "$DOMAIN/" | head -1

echo "Live: $DOMAIN"
