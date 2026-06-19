#!/usr/bin/env bash
# Cash sprint production deploy — login, BCID docs, outreach CRM, x402 research.
# Run from repo root on the VPS or via scripts/deploy-ssh.sh wrapper.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> 1/4 Prisma migrate (Outreach CRM)"
cd app
npx prisma migrate deploy
cd "$ROOT"

echo "==> 2/4 Build web image (uses deploy/.env → app/.env)"
if [[ -x scripts/deploy-ssh.sh ]]; then
  echo "    Run: ./scripts/deploy-ssh.sh"
  echo "    (This script does not auto-deploy — operator confirms deploy/.env has X402_* + STRIPE_* first)"
else
  echo "    Manual: docker compose build && docker compose up -d"
fi

echo "==> 3/4 Post-deploy smoke"
echo "    npm run cash-sprint:prep https://app.buildingcultureid.space"
echo "    npm run grant:priority1"

echo "==> 4/4 Operator"
echo "    docs/CASH_SPRINT_OPERATOR.md"
echo "    docs/CASH_SPRINT_AMPLIFY.md"
echo "    npm run outreach:queue"
