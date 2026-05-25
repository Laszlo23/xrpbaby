#!/usr/bin/env bash
# Start local Postgres for b3 app (port 55432) and apply migrations.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${BC_LOCAL_PG_CONTAINER:-bc-b3-local}"

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "==> Starting $CONTAINER"
  docker start "$CONTAINER" >/dev/null
else
  echo "==> Creating $CONTAINER via app/docker-compose.stack.yml"
  if [[ ! -f "$ROOT/app/.env" ]]; then
    echo "error: missing app/.env — copy app/.env.example and set POSTGRES_PASSWORD"
    exit 1
  fi
  if ! grep -qE '^POSTGRES_PASSWORD=.+' "$ROOT/app/.env" 2>/dev/null; then
    echo "error: set POSTGRES_PASSWORD in app/.env for docker compose"
    exit 1
  fi
  cd "$ROOT/app"
  docker compose -f docker-compose.stack.yml up -d postgres
  CONTAINER="$(docker compose -f docker-compose.stack.yml ps -q postgres)"
fi

echo "==> Waiting for Postgres"
for i in $(seq 1 30); do
  if docker exec "$CONTAINER" pg_isready -U buildingculture -d buildingculture >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec "$CONTAINER" pg_isready -U buildingculture -d buildingculture

echo "==> prisma migrate deploy"
cd "$ROOT/app"
npx prisma migrate deploy

echo "==> Ready. DATABASE_URL should use 127.0.0.1:55432"
