#!/usr/bin/env bash
# Install systemd timer for Grove marketing tick (every 4 hours by default, or daily).
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export B3_ROOT=/opt/bc-b3
#   ./scripts/install-grove-cron.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
B3_ROOT_LOCAL="$(cd "$SCRIPT_DIR/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE_ROOT="${B3_ROOT:-/opt/bc-b3}"
SCHEDULE_PROFILE="${GROVE_SCHEDULE_PROFILE:-legacy_4h}"

echo "==> Rsync b3 → ${HOST}:${REMOTE_ROOT}/"
ssh -o BatchMode=yes "$HOST" "mkdir -p '${REMOTE_ROOT}'"
rsync -az \
  --exclude node_modules \
  --exclude .git \
  -e "ssh -o BatchMode=yes" \
  "$B3_ROOT_LOCAL/" "${HOST}:${REMOTE_ROOT}/"

echo "==> Remote: install bc-grove-tick timer (${SCHEDULE_PROFILE})"
ssh -o BatchMode=yes "$HOST" "export REMOTE_ROOT='${REMOTE_ROOT}'; export SCHEDULE_PROFILE='${SCHEDULE_PROFILE}'; bash -s" <<'REMOTE'
set -euo pipefail
cd "$REMOTE_ROOT"
npm install --no-audit --no-fund --prefix app 2>/dev/null || npm install --no-audit --no-fund

UNIT=/etc/systemd/system/bc-grove-tick.service
TIMER=/etc/systemd/system/bc-grove-tick.timer

sudo bash -c "cat > \"$UNIT\"" <<EOF
[Unit]
Description=Grove marketing agent tick

[Service]
Type=oneshot
WorkingDirectory=${REMOTE_ROOT}/app
EnvironmentFile=-${REMOTE_ROOT}/app/.env
EnvironmentFile=-/etc/bc-grove-tick.env
ExecStart=/usr/bin/env bash -lc 'cd ${REMOTE_ROOT}/app && npm run grove:tick'
EOF

if [[ "${SCHEDULE_PROFILE:-legacy_4h}" == "daily" ]]; then
  TIMER_BODY='OnCalendar=*-*-* 09:00:00 UTC'
  TIMER_DESC='Run Grove tick daily (09:00 UTC)'
else
  TIMER_BODY='OnUnitActiveSec=4h'
  TIMER_DESC='Run Grove tick every 4 hours'
fi

sudo bash -c "cat > \"$TIMER\"" <<EOF
[Unit]
Description=${TIMER_DESC}

[Timer]
OnBootSec=5min
${TIMER_BODY}
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable bc-grove-tick.timer 2>/dev/null || true
sudo systemctl restart bc-grove-tick.timer 2>/dev/null || true
echo "Installed bc-grove-tick.service + .timer (${SCHEDULE_PROFILE:-legacy_4h})"
REMOTE

echo "==> Set on server app/.env or /etc/bc-grove-tick.env:"
echo "    GROVE_AUTO_POST=1"
echo "    GROVE_SCHEDULE_PROFILE=${SCHEDULE_PROFILE}"
echo "    GROVE_MARKETING_ADMIN_SECRET=..."
echo "    GROVE_X_* or X_* for posting"
echo "    GROVE_NEYNAR_SIGNER_UUID + NEYNAR_API_KEY for Farcaster"
echo "    GROVE_TELEGRAM_BOT_TOKEN + GROVE_TELEGRAM_CHAT_ID for Telegram"
echo "    DATABASE_URL for Pulse metrics in brief"
echo "==> Test: ssh $HOST 'cd ${REMOTE_ROOT}/app && npm run grove:tick -- --dry-run'"
