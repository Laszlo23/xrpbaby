#!/usr/bin/env bash
# Install systemd timer for weekly Culture Roots treasury funding (Mondays 10:00 UTC).
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export B3_ROOT=/opt/bc-b3
#   ./scripts/install-bcc-roots-cron.sh
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

echo "==> Remote: install bc-bcc-roots-rewards.timer"
ssh -o BatchMode=yes "$HOST" "export REMOTE_ROOT='${REMOTE_ROOT}'; bash -s" <<'REMOTE'
set -euo pipefail
cd "$REMOTE_ROOT"

UNIT=/etc/systemd/system/bc-bcc-roots-rewards.service
TIMER=/etc/systemd/system/bc-bcc-roots-rewards.timer

sudo bash -c "cat > \"$UNIT\"" <<EOF
[Unit]
Description=Culture Roots weekly notifyRewardAmount

[Service]
Type=oneshot
WorkingDirectory=${REMOTE_ROOT}/app
EnvironmentFile=-${REMOTE_ROOT}/app/.env
ExecStart=/usr/bin/env bash -lc 'cd ${REMOTE_ROOT}/app && npm run bcc:roots-rewards-keeper'
EOF

sudo bash -c "cat > \"$TIMER\"" <<EOF
[Unit]
Description=Fund Culture Roots pools weekly (Monday 10:00 UTC)

[Timer]
OnCalendar=Mon *-*-* 10:00:00 UTC
OnBootSec=20min
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable bc-bcc-roots-rewards.timer 2>/dev/null || true
sudo systemctl restart bc-bcc-roots-rewards.timer 2>/dev/null || true
echo "Installed bc-bcc-roots-rewards.service + .timer"
REMOTE

echo "==> Requires on server app/.env:"
echo "    BCC_ROOTS_STAKING_ADDRESS, BCC_ROOTS_REWARD_AMOUNT_WEI, BCC_TREASURY_PRIVATE_KEY"
echo "    BCC_ROOTS_REWARDS_KEEPER_DRY_RUN=0, BCC_TREASURY_ONCHAIN=1"
echo "==> Test: ssh $HOST 'cd ${REMOTE_ROOT}/app && BCC_ROOTS_REWARDS_KEEPER_DRY_RUN=1 npm run bcc:roots-rewards-keeper'"
