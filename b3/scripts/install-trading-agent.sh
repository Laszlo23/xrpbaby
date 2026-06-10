#!/usr/bin/env bash
# Install bc-trading-agent systemd service on the production VPS.
# Run locally after deploy-ssh has synced packages/trading-agent to the server.
#
#   ./scripts/install-trading-agent.sh
#   DEPLOY_HOST=root@187.124.18.204 ./scripts/install-trading-agent.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_ENV="$ROOT/deploy/.env"

if [[ ! -f "$DEPLOY_ENV" ]]; then
  echo "error: missing $DEPLOY_ENV"
  exit 1
fi

export DEPLOY_HOST="${DEPLOY_HOST:-root@187.124.18.204}"
export DEPLOY_PATH="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
export SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH_OPTS=( -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes )

# shellcheck disable=SC1090
set -a && source "$DEPLOY_ENV" && set +a
RPC_URI="${SUGAR_RPC_URI_8453:-${BASE_RPC_URL:-https://mainnet.base.org}}"
PAPER_MODE="${TRADING_AGENT_PAPER_MODE:-1}"
PORT="${TRADING_AGENT_PORT:-8765}"

echo "==> Install trading agent on $DEPLOY_HOST ($DEPLOY_PATH, port $PORT)"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" bash -s -- "$DEPLOY_PATH" "$RPC_URI" "$PAPER_MODE" "$PORT" <<'REMOTE'
set -euo pipefail
RDIR="$1"
RPC_URI="$2"
PAPER_MODE="$3"
PORT="$4"
PKG="$RDIR/packages/trading-agent"

if [[ ! -d "$PKG" ]]; then
  echo "error: $PKG missing — run deploy-ssh.sh first"
  exit 1
fi

cd "$PKG"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt

cat > /etc/systemd/system/bc-trading-agent.service <<EOF
[Unit]
Description=BC Trading Agent (sugar-sdk Aerodrome quotes)
After=network.target

[Service]
Type=simple
WorkingDirectory=${PKG}
Environment=PYTHONPATH=${PKG}
Environment=SUGAR_RPC_URI_8453=${RPC_URI}
Environment=TRADING_AGENT_PORT=${PORT}
Environment=TRADING_AGENT_PAPER_MODE=${PAPER_MODE}
ExecStart=${PKG}/.venv/bin/python -m trading_agent.server
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable bc-trading-agent
systemctl restart bc-trading-agent

sleep 3
if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null; then
  echo "OK   trading agent healthy on :${PORT}"
else
  echo "FAIL trading agent not responding on :${PORT}"
  journalctl -u bc-trading-agent -n 30 --no-pager || true
  exit 1
fi
REMOTE

echo "==> Done. Set TRADING_AGENT_URL=http://host.docker.internal:${PORT} in deploy/.env and redeploy web."
