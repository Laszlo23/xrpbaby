#!/bin/sh
set -eu
# Apply migrations before serving (idempotent). Requires DATABASE_URL at runtime.
if [ -n "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] prisma migrate deploy…"
  npx prisma migrate deploy
else
  echo "[entrypoint] DATABASE_URL unset — skipping migrations (leaderboard / points DB offline)."
fi
exec node scripts/serve-production.mjs
