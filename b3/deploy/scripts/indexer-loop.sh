#!/usr/bin/env sh
# Periodic `chain:index` for AgentShareCampaign Minted logs (Prisma ChainMintEvent).
set -eu
INTERVAL="${INDEXER_INTERVAL_SEC:-300}"
cd /app/app
echo "[indexer] interval=${INTERVAL}s"
while true; do
  npm run chain:index || echo "[indexer] chain:index failed (continuing)"
  sleep "$INTERVAL"
done
