#!/usr/bin/env bash
# Ensure INVESTOR_WORKSHOP_SECRET exists in deploy/.env and sync → app/.env.
# Change the password in deploy/.env after first deploy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="$ROOT/deploy/.env"

if [[ ! -f "$DEPLOY_ENV" ]]; then
  echo "error: missing $DEPLOY_ENV — cp deploy/.env.example deploy/.env and edit"
  exit 1
fi

if ! grep -q '^INVESTOR_WORKSHOP_SECRET=' "$DEPLOY_ENV" 2>/dev/null; then
  SECRET="$(openssl rand -hex 24)"
  {
    echo ""
    echo "# Private investor workshop — /investors/workshop (change this password)"
    echo "INVESTOR_WORKSHOP_SECRET=${SECRET}"
  } >> "$DEPLOY_ENV"
  echo "==> Added INVESTOR_WORKSHOP_SECRET to deploy/.env (change it when ready)"
else
  echo "==> INVESTOR_WORKSHOP_SECRET already in deploy/.env"
fi

"$ROOT/scripts/sync-deploy-env.sh"
echo "==> Synced deploy/.env → app/.env"
echo "    Edit password: deploy/.env (canonical) — not committed to git"
