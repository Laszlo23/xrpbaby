#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ankommen}"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# PostgreSQL dump
docker exec ankommen-postgres pg_dump -U ankommen ankommen | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Keep last 14 days
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +14 -delete

echo "Backup complete: $BACKUP_DIR/db_$DATE.sql.gz"
