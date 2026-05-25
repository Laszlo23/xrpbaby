#!/usr/bin/env bash
# Start Postgres, run migrations, then the platform dev server on :5173.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Starting local Postgres (bc-b3-local)…"
npm run db:start

echo "==> Applying Prisma migrations…"
npm run db:migrate

echo ""
echo "Platform ready (after Vite starts):"
echo "  Forest  → http://localhost:5173/forest"
echo "  Join    → http://localhost:5173/join"
echo "  Welcome → http://localhost:5173/welcome"
echo ""
echo "Strapi (optional, second terminal): npm run dev:strapi → http://127.0.0.1:1337/admin"
echo "  Wire STRAPI_URL / VITE_STRAPI_URL / STRAPI_API_TOKEN in app/.env for /roadmap and /docs"
echo ""
echo "Healthcheck (in another terminal): npm run dev:healthcheck"
echo ""

exec npm run dev
