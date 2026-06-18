#!/bin/sh
set -eu
# Apply migrations before serving (idempotent). Requires DATABASE_URL at runtime.
if [ -n "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] prisma migrate deploy…"
  i=0
  max="${PRISMA_MIGRATE_RETRIES:-20}"
  delay="${PRISMA_MIGRATE_DELAY_S:-2}"
  while :; do
    if ./node_modules/.bin/prisma migrate deploy; then
      break
    fi
    i=$((i + 1))
    if [ "$i" -ge "$max" ]; then
      echo "[entrypoint] prisma migrate deploy failed after ${max} attempts."
      exit 1
    fi
    echo "[entrypoint] prisma migrate deploy failed; retrying in ${delay}s (${i}/${max})…"
    sleep "$delay"
  done
  if [ -f prisma/seed-credentials.ts ]; then
    echo "[entrypoint] seeding credential catalog…"
    if ./node_modules/.bin/tsx prisma/seed-credentials.ts; then
      echo "[entrypoint] credential seed complete."
    else
      echo "[entrypoint] credential seed failed (non-fatal — static catalog still works)."
    fi
  fi
else
  echo "[entrypoint] DATABASE_URL unset — skipping migrations (leaderboard / points DB offline)."
fi
exec node scripts/serve-production.mjs
