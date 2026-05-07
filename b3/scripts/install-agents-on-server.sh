#!/usr/bin/env bash
# Build @bc/agent-runtime and install a systemd timer on the VPS (15 min tick).
#
#   export DEPLOY_HOST=root@your.vps.ip
#   export B3_ROOT=/opt/bc-b3
#   ./scripts/install-agents-on-server.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
B3_ROOT_LOCAL="$(cd "$SCRIPT_DIR/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE_ROOT="${B3_ROOT:-/opt/bc-b3}"

echo "==> Rsync b3 workspace → ${HOST}:${REMOTE_ROOT}/"
ssh -o BatchMode=yes "$HOST" "mkdir -p '${REMOTE_ROOT}'"
rsync -az \
  --exclude node_modules \
  --exclude 'frontend/node_modules' \
  --exclude 'ecorwa/node_modules' \
  --exclude 'strapiapp/node_modules' \
  --exclude .git \
  -e "ssh -o BatchMode=yes" \
  "$B3_ROOT_LOCAL/" "${HOST}:${REMOTE_ROOT}/"

echo "==> Remote: npm install + build agent-runtime"
ssh -o BatchMode=yes "$HOST" "export REMOTE_ROOT='${REMOTE_ROOT}'; bash -s" <<'REMOTE'
set -euo pipefail
cd "$REMOTE_ROOT"
npm install --no-audit --no-fund
npm --prefix packages/agent-runtime run build

UNIT=/etc/systemd/system/bc-agent-tick.service
TIMER=/etc/systemd/system/bc-agent-tick.timer
SNAP=/var/lib/bc-agent-ledger-snapshots

sudo bash -c "cat > \"$UNIT\"" <<EOF
[Unit]
Description=Building Culture agent runtime tick
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=${REMOTE_ROOT}
EnvironmentFile=-/etc/bc-agent-tick.env
ExecStart=/usr/bin/env bash -lc 'cd ${REMOTE_ROOT} && node packages/agent-runtime/dist/cli/run-tick.js --agent all --config ${REMOTE_ROOT}/ops/agents.json'
EOF

sudo bash -c "cat > \"$TIMER\"" <<'EOF'
[Unit]
Description=Run bc-agent-tick every 15 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=15min
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo mkdir -p "$SNAP"
sudo systemctl daemon-reload
sudo systemctl enable bc-agent-tick.timer 2>/dev/null || true
sudo systemctl restart bc-agent-tick.timer 2>/dev/null || true
echo "Installed bc-agent-tick.service + .timer"
REMOTE

echo "==> Create /etc/bc-agent-tick.env on the server (DATABASE_URL, STRAPI_URL, STRAPI_API_TOKEN, AGENTS_PAUSED, ECON_LIVE, AGENT_BASE_RPC_URL, AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY when ready)."
echo "==> Ledger snapshots: tar /var/lib/postgresql/data or use pg_dump — see b3/ops/AGENT_PHASE0.md"
