#!/usr/bin/env bash
# Start Postgres + migrations, then the app. Run Strapi in a second terminal.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Starting local Postgres (bc-b3-local)…"
npm run db:start

echo "==> Applying Prisma migrations…"
npm run db:migrate

echo ""
echo "Full stack (two terminals):"
echo "  Terminal A (this):  npm run dev          → http://localhost:5173"
echo "  Terminal B:         npm run dev:strapi   → http://127.0.0.1:1337/admin"
echo ""
echo "In app/.env set:"
echo "  VITE_STRAPI_URL=http://127.0.0.1:1337"
echo "  STRAPI_URL=http://127.0.0.1:1337"
echo "  STRAPI_API_TOKEN=<from Strapi Admin → Settings → API Tokens>"
echo ""
echo "Healthcheck: npm run dev:healthcheck"
echo ""

exec npm run dev
