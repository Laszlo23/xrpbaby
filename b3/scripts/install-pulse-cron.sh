#!/usr/bin/env bash
# Install pulse ingest + attest cron entries (run on VPS as root).
set -euo pipefail
ROOT="${DEPLOY_PATH:-/opt/buildingculture}"
CRON_FILE="/etc/cron.d/buildingculture-pulse"

cat > "$CRON_FILE" <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
# Pulse ingest every 15 minutes
*/15 * * * * root cd $ROOT && /usr/bin/npm run pulse:ingest >> /var/log/bc-pulse-ingest.log 2>&1
# Daily attestation 00:05 UTC
5 0 * * * root cd $ROOT && /usr/bin/npm run pulse:attest >> /var/log/bc-pulse-attest.log 2>&1
EOF

chmod 644 "$CRON_FILE"
echo "Installed $CRON_FILE (set DEPLOY_PATH if not /opt/buildingculture)"
