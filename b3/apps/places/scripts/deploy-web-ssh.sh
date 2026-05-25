#!/usr/bin/env bash
# Remote deploy: pull latest main, rebuild Docker image, restart stack.
#
# Config: export DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH (and optionally DEPLOY_SSH_PASSWORD),
# or place them in repo-root `.env.deploy` (gitignored via `.env.*`).
#
# Usage:
#   ./scripts/deploy-web-ssh.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [[ -f "$REPO_ROOT/.env.deploy" ]]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck source=/dev/null
  source "$REPO_ROOT/.env.deploy"
  set +a
fi

: "${DEPLOY_HOST:?Set DEPLOY_HOST or add to .env.deploy}"
: "${DEPLOY_USER:?Set DEPLOY_USER or add to .env.deploy}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH or add to .env.deploy}"

SSH_BASE=(ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30)
if [[ -n "${DEPLOY_SSH_PASSWORD:-}" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "DEPLOY_SSH_PASSWORD is set but sshpass is not installed (e.g. brew install sshpass)." >&2
    exit 1
  fi
  export SSHPASS="$DEPLOY_SSH_PASSWORD"
  SSH_CMD=(sshpass -e "${SSH_BASE[@]}")
else
  SSH_CMD=("${SSH_BASE[@]}" -o BatchMode=yes)
fi

"${SSH_CMD[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s <<EOF
set -euo pipefail
cd "${DEPLOY_PATH}"
git fetch origin main && git checkout main && git pull --ff-only origin main
docker compose build --pull
docker compose up -d
docker compose ps
EOF
