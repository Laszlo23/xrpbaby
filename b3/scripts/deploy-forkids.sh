#!/usr/bin/env bash
# Build and run KinderStimme (forkids) on VPS port 3030.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/apps/behoerden/forkids"
HOST="${1:-root@187.124.18.204}"
REMOTE_DIR="${FORKIDS_REMOTE_DIR:-/opt/forkids}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH=(ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes)
PORT="${FORKIDS_PORT:-3030}"

echo "==> Rsync forkids -> $HOST:$REMOTE_DIR"
"${SSH[@]}" "$HOST" "mkdir -p $REMOTE_DIR"
rsync -avz --delete -e "ssh -i $SSH_KEY -o IdentitiesOnly=yes" \
  --exclude node_modules --exclude .output --exclude dist --exclude test-results \
  "$APP/" "$HOST:$REMOTE_DIR/"

echo "==> Remote build + systemd service on :$PORT"
"${SSH[@]}" "$HOST" "bash -s" <<REMOTE
set -euo pipefail
cd "$REMOTE_DIR"
if ! command -v node >/dev/null; then
  echo "error: node required on server"
  exit 1
fi
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
cat > /etc/systemd/system/forkids.service <<UNIT
[Unit]
Description=KinderStimme forkids TanStack app
After=network.target

[Service]
Type=simple
WorkingDirectory=$REMOTE_DIR
Environment=PORT=$PORT
Environment=NODE_ENV=production
ExecStart=/usr/bin/node scripts/serve-production.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable forkids
systemctl restart forkids
sleep 2
curl -sf -o /dev/null -w "local %{http_code}\n" "http://127.0.0.1:$PORT/" || systemctl status forkids --no-pager
REMOTE

echo "Done. forkids on https://forkids.buildingcultureid.space"
