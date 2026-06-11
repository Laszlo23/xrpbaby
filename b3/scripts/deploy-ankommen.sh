#!/usr/bin/env bash
# Build Ankommen web locally and run on VPS port 3020 (marketing + app shell).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANKOMMEN="$ROOT/apps/Ankommen"
HOST="${1:-root@187.124.18.204}"
REMOTE_DIR="${ANKOMMEN_REMOTE_DIR:-/opt/ankommen}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH=(ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes)
PORT="${ANKOMMEN_PORT:-3020}"
PUBLIC_URL="https://ankommen.buildingcultureid.space"

if [[ "${SKIP_ANKOMMEN_BUILD:-0}" != "1" ]]; then
  echo "==> Local build @ankommen/web"
  cd "$ANKOMMEN"
  if ! command -v pnpm >/dev/null; then
    corepack enable
    corepack prepare pnpm@9.15.0 --activate
  fi

  NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-ankommen-gtm-$(openssl rand -hex 16)}"
  export NEXTAUTH_URL="$PUBLIC_URL"
  export NEXTAUTH_SECRET
  export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-$PUBLIC_URL}"

  CI=1 pnpm install --frozen-lockfile 2>/dev/null || CI=1 pnpm install
  NODE_ENV=production pnpm --filter @ankommen/web build
else
  echo "==> SKIP_ANKOMMEN_BUILD=1 — using existing .next"
  NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-ankommen-gtm-$(openssl rand -hex 16)}"
fi

echo "==> Rsync monorepo (pre-built web) -> $HOST:$REMOTE_DIR"
"${SSH[@]}" "$HOST" "mkdir -p $REMOTE_DIR"
rsync -avz --delete -e "ssh -i $SSH_KEY -o IdentitiesOnly=yes" \
  --exclude node_modules --exclude .git --exclude apps/mobile --exclude services/api/dist \
  --exclude .env --exclude '**/.env' --exclude '**/.env.local' \
  "$ANKOMMEN/" "$HOST:$REMOTE_DIR/"

echo "==> Remote install production deps + systemd on :$PORT"
"${SSH[@]}" "$HOST" "bash -s" <<REMOTE
set -euo pipefail
cd "$REMOTE_DIR"
if ! command -v pnpm >/dev/null; then
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi
CI=1 pnpm install --filter @ankommen/web --frozen-lockfile 2>/dev/null || \
  CI=1 pnpm install --filter @ankommen/web

cat > "$REMOTE_DIR/apps/web/.env.production.local" <<ENV
NEXTAUTH_URL=$PUBLIC_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXT_PUBLIC_API_URL=$PUBLIC_URL
ENV

cat > /etc/systemd/system/ankommen-web.service <<UNIT
[Unit]
Description=Ankommen AI Next.js web
After=network.target

[Service]
Type=simple
WorkingDirectory=$REMOTE_DIR/apps/web
Environment=PORT=$PORT
Environment=NODE_ENV=production
EnvironmentFile=$REMOTE_DIR/apps/web/.env.production.local
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable ankommen-web
systemctl restart ankommen-web
sleep 3
curl -sf -o /dev/null -w "local %{http_code}\n" "http://127.0.0.1:$PORT/" || systemctl status ankommen-web --no-pager -l
REMOTE

echo "Done. Ankommen on $PUBLIC_URL (ensure nginx uses nginx-ankommen-native.example.conf)"
