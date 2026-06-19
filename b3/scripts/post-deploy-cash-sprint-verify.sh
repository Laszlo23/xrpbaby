#!/usr/bin/env bash
# Run after VPS docker build completes (cash sprint deploy).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ORIGIN="${1:-https://app.buildingcultureid.space}"

echo "==> Prisma migrate (outreach CRM)"
ssh -i "${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}" -o BatchMode=yes "${DEPLOY_HOST:-root@187.124.18.204}" \
  'cd /opt/buildingculture-frontend/app && docker compose -f docker-compose.stack.yml --env-file .env exec -T web npx prisma migrate deploy'

echo "==> Outreach seed (idempotent)"
ssh -i "${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}" -o BatchMode=yes "${DEPLOY_HOST:-root@187.124.18.204}" \
  'cd /opt/buildingculture-frontend && node scripts/seed-outreach-targets.mjs' || true

echo "==> Cash sprint smoke"
npm run cash-sprint:prep "$ORIGIN"

echo "==> Grant verifier (target 0 hard fails)"
npm run grant:priority1

echo "Done. Attach proof-bundles/grant-verification-*.md to 0G + Chainlink submissions."
