#!/usr/bin/env bash
# Deploy Grove + app to production (app.buildingcultureid.space → 187.124.18.204).
#
#   ./scripts/deploy-grove.sh
#   GROVE_AUTO_POST=1 ./scripts/deploy-grove.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_ENV="$ROOT/deploy/.env"

if [[ ! -f "$DEPLOY_ENV" ]]; then
  echo "error: missing $DEPLOY_ENV — cp deploy/.env.example deploy/.env"
  exit 1
fi

export DEPLOY_HOST="${DEPLOY_HOST:-root@187.124.18.204}"
export DEPLOY_PATH="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
export APP_PORT="${APP_PORT:-3011}"
export SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
export GROVE_SCHEDULE_PROFILE="${GROVE_SCHEDULE_PROFILE:-legacy_4h}"

# Ensure Grove block exists in deploy/.env (never overwrite existing secret).
if ! grep -q '^GROVE_MARKETING_ADMIN_SECRET=' "$DEPLOY_ENV" 2>/dev/null; then
  SECRET="$(openssl rand -hex 24)"
  {
    echo ""
    echo "# Grove marketing agent (auto-added by deploy-grove.sh)"
    echo "GROVE_MARKETING_ADMIN_SECRET=${SECRET}"
    echo "GROVE_AUTO_POST=${GROVE_AUTO_POST:-0}"
    echo "GROVE_ATTEST_POST=1"
    echo "GROVE_SCHEDULE_PROFILE=${GROVE_SCHEDULE_PROFILE}"
    echo "GROVE_AGENT_REF=grove"
    echo "GROVE_TICK_URL=https://app.buildingcultureid.space/api/marketing/grove/tick"
  } >> "$DEPLOY_ENV"
  echo "==> Added GROVE_MARKETING_ADMIN_SECRET to deploy/.env"
fi

# Allow one-shot override without editing file.
if [[ -n "${GROVE_AUTO_POST:-}" ]]; then
  if grep -q '^GROVE_AUTO_POST=' "$DEPLOY_ENV"; then
    sed -i.bak "s/^GROVE_AUTO_POST=.*/GROVE_AUTO_POST=${GROVE_AUTO_POST}/" "$DEPLOY_ENV"
    rm -f "$DEPLOY_ENV.bak"
  else
    echo "GROVE_AUTO_POST=${GROVE_AUTO_POST}" >> "$DEPLOY_ENV"
  fi
fi

echo "==> Deploy to $DEPLOY_HOST ($DEPLOY_PATH, port $APP_PORT)"
"$ROOT/scripts/sync-deploy-env.sh"
DEPLOY_HOST="$DEPLOY_HOST" DEPLOY_PATH="$DEPLOY_PATH" APP_PORT="$APP_PORT" SSH_KEY="$SSH_KEY" \
  "$ROOT/scripts/deploy-ssh.sh"

# deploy-ssh excludes app/.env — push operator secrets from deploy/.env
SSH_OPTS=( -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes )
rsync -avz -e "ssh ${SSH_OPTS[*]}" "$DEPLOY_ENV" "$DEPLOY_HOST:$DEPLOY_PATH/app/.env"

echo "==> Remote: merge Grove env + recreate web on port $APP_PORT"
ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes "$DEPLOY_HOST" bash -s -- "$DEPLOY_PATH" "$APP_PORT" <<'REMOTE'
set -euo pipefail
RDIR="$1"
PORT="$2"
ENV="$RDIR/app/.env"
grep -q '^GROVE_MARKETING_ADMIN_SECRET=' "$ENV" || {
  echo "warn: GROVE_MARKETING_ADMIN_SECRET missing on server — copy from deploy/.env"
}
cd "$RDIR"
APP_PORT="$PORT" docker compose -f app/docker-compose.stack.yml --env-file app/.env up -d --force-recreate web
REMOTE

# shellcheck disable=SC1090
set -a && source "$DEPLOY_ENV" && set +a
SECRET="${GROVE_MARKETING_ADMIN_SECRET:-}"
if [[ -z "$SECRET" ]]; then
  echo "warn: no GROVE_MARKETING_ADMIN_SECRET locally — skip timer refresh"
  exit 0
fi

echo "==> Install / refresh Grove timer profile=${GROVE_SCHEDULE_PROFILE} (POST localhost:$APP_PORT)"
ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes "$DEPLOY_HOST" bash -s -- "$APP_PORT" "$SECRET" "$GROVE_SCHEDULE_PROFILE" <<'REMOTE'
set -euo pipefail
PORT="$1"
SECRET="$2"
SCHEDULE_PROFILE="${3:-legacy_4h}"
cat > /etc/systemd/system/bc-grove-tick.service <<EOF
[Unit]
Description=Grove marketing agent tick

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -sS -X POST http://127.0.0.1:${PORT}/api/marketing/grove/tick \\
  -H "Content-Type: application/json" \\
  -H "x-grove-marketing-admin-secret: ${SECRET}" \\
  -d '{"dryRun":false}'
EOF
if [[ "$SCHEDULE_PROFILE" == "daily" ]]; then
  TIMER_BODY='OnCalendar=*-*-* 09:00:00 UTC'
  TIMER_DESC='Run Grove tick daily (09:00 UTC)'
else
  TIMER_BODY='OnUnitActiveSec=4h'
  TIMER_DESC='Run Grove tick every 4 hours'
fi
cat > /etc/systemd/system/bc-grove-tick.timer <<EOF
[Unit]
Description=${TIMER_DESC}

[Timer]
OnBootSec=3min
${TIMER_BODY}
Persistent=true

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable bc-grove-tick.timer
systemctl restart bc-grove-tick.timer
REMOTE

echo "==> Smoke"
BASE="${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}"
curl -sS "${BASE%/}/api/marketing/grove/tick" | head -c 400 || true
echo ""
echo "==> Done. Live posts need GROVE_AUTO_POST=1 + X_* or GROVE_X_* in app/.env on server."
