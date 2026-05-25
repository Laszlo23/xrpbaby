#!/usr/bin/env bash
# Prepare Vite build env and build the production image.
# Requires b3/app/.env (copy from .env.example and fill VITE_* / server keys).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$APP_DIR/.." && pwd)"

cd "$APP_DIR"
mkdir -p docker
if [[ ! -f .env ]]; then
  echo "error: b3/app/.env missing — copy .env.example and configure."
  exit 1
fi
cp .env docker/dotenv-for-build
export IMAGE_NAME="${IMAGE_NAME:-buildingculture-frontend:latest}"
cd "$ROOT_DIR"
export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"
docker build ${DOCKER_BUILD_ARGS:-} -f app/Dockerfile -t "$IMAGE_NAME" .
echo "Built $IMAGE_NAME"
