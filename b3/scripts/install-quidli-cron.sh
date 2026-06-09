#!/usr/bin/env bash
# Install systemd timer for weekly Quidli leaderboard BCC drops (Mondays 10:00 UTC).
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export B3_ROOT=/opt/bc-b3
#   ./scripts/install-quidli-cron.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
B3_ROOT_LOCAL="$(cd "$SCRIPT_DIR/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE_ROOT="${B3_ROOT:-/opt/bc-b3}"

echo "==> Rsync b3 → ${HOST}:${REMOTE_ROOT}/"
ssh -o BatchMode=yes "$HOST" "mkdir -p '${REMOTE_ROOT}'"
rsync -az \
  --exclude node_modules \
  --exclude .git \
  -e "ssh -o BatchMode=yes" \
  "$B3_ROOT_LOCAL/" "${HOST}:${REMOTE_ROOT}/"

echo "==> Remote: install bc-quidli-leaderboard.timer"
ssh -o BatchMode=yes "$HOST" "export REMOTE_ROOT='${REMOTE_ROOT}'; bash -s" <<'REMOTE'
set -euo pipefail
cd "$REMOTE_ROOT"

UNIT=/etc/systemd/system/bc-quidli-leaderboard.service
TIMER=/etc/systemd/system/bc-quidli-leaderboard.timer

sudo bash -c "cat > \"$UNIT\"" <<EOF
[Unit]
Description=Quidli weekly leaderboard BCC drops

[Service]
Type=oneshot
WorkingDirectory=${REMOTE_ROOT}/app
EnvironmentFile=-${REMOTE_ROOT}/app/.env
EnvironmentFile=-/etc/bc-grove-tick.env
ExecStart=/usr/bin/env bash -lc 'cd ${REMOTE_ROOT}/app && npm run quidli:leaderboard-drops'
EOF

sudo bash -c "cat > \"$TIMER\"" <<EOF
[Unit]
Description=Run Quidli leaderboard drops weekly (Monday 10:00 UTC)

[Timer]
OnCalendar=Mon *-*-* 10:00:00 UTC
OnBootSec=15min
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable bc-quidli-leaderboard.timer 2>/dev/null || true
sudo systemctl restart bc-quidli-leaderboard.timer 2>/dev/null || true
echo "Installed bc-quidli-leaderboard.service + .timer"
REMOTE

echo "==> Requires on server app/.env:"
echo "    QUIDLI_API_KEY, QUIDLI_REWARD_* caps, GROVE_MARKETING_ADMIN_SECRET"
echo "==> Test: ssh $HOST 'cd ${REMOTE_ROOT}/app && npm run quidli:leaderboard-drops -- --dry-run'"
