#!/usr/bin/env bash
# Install 4-hour reliability endpoint loop on VPS (run as root).
set -euo pipefail
ROOT="${DEPLOY_PATH:-/opt/buildingculture}"
CRON_FILE="/etc/cron.d/buildingculture-reliability"
ENV_FILE="${ROOT}/deploy/.env"

cat > "$CRON_FILE" <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
# Reliability gate — every 4 hours (ECO-001)
0 */4 * * * root set -a && [ -f ${ENV_FILE} ] && . ${ENV_FILE} && set +a && cd ${ROOT} && /usr/bin/node scripts/reliability-endpoint-loop.mjs >> /var/log/bc-reliability.log 2>&1
EOF

chmod 644 "$CRON_FILE"
echo "Installed $CRON_FILE"
echo "Set RELIABILITY_SLACK_WEBHOOK_URL in deploy/.env for Slack alerts"
