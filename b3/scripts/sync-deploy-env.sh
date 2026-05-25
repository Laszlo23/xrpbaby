#!/usr/bin/env bash
# Copy deploy/.env → app/.env so docker-build.sh bakes VITE_* for production images.
# WARNING: overwrites app/.env — back up local dev settings first or maintain deploy/.env separately.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/deploy/.env"
DST="$ROOT/app/.env"
if [[ ! -f "$SRC" ]]; then
  echo "error: $SRC missing — cp deploy/.env.example deploy/.env and edit"
  exit 1
fi
cp "$SRC" "$DST"
echo "Synced $SRC → $DST"
