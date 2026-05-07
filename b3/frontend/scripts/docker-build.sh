#!/usr/bin/env bash
# Prepare Vite build env and build the production image.
# Usage (from repo): ./scripts/docker-build.sh
# Requires b3/frontend/.env (copy from .env.example and fill VITE_* / server keys).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docker
if [[ ! -f .env ]]; then
  echo "error: b3/frontend/.env missing — copy .env.example and configure."
  exit 1
fi
cp .env docker/dotenv-for-build
export IMAGE_NAME="${IMAGE_NAME:-buildingculture-frontend:latest}"
docker build -t "$IMAGE_NAME" .
echo "Built $IMAGE_NAME"
