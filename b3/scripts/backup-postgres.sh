#!/usr/bin/env bash
# Snapshot Postgres volume for the deploy stack (run on VPS from deploy/).
set -euo pipefail
cd "$(dirname "$0")/../deploy"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="${1:-./backups/pg-$STAMP.sql.gz}"
mkdir -p "$(dirname "$OUT")"
set -a
# shellcheck disable=SC1091
source .env
set +a
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-buildingculture}" "${POSTGRES_DB:-buildingculture}" | gzip > "$OUT"
echo "Wrote $OUT"
