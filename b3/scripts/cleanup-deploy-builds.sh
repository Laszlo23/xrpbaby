#!/usr/bin/env bash
# Stop stuck deploy builds on the VPS (parallel docker/vite builds peg CPU).
set -euo pipefail
HOST="${DEPLOY_HOST:-root@187.124.18.204}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH_OPTS=( -o BatchMode=yes -o ConnectTimeout=15 )
[[ -f "$SSH_KEY" ]] && SSH_OPTS=( -i "$SSH_KEY" "${SSH_OPTS[@]}" )

echo "==> Stopping stuck builds on $HOST"
ssh "${SSH_OPTS[@]}" "$HOST" bash -s <<'REMOTE'
set -euo pipefail
echo "Before:" && uptime
pkill -9 -f "buildx build -f app/Dockerfile" 2>/dev/null || true
pkill -9 -f "docker build -f app/Dockerfile" 2>/dev/null || true
pkill -9 -f "app/scripts/docker-build.sh" 2>/dev/null || true
pkill -9 -f "/repo/node_modules/.bin/vite build" 2>/dev/null || true
pkill -9 -f "npm run build" 2>/dev/null || true
rm -f /tmp/buildingculture-deploy.lock
docker buildx prune -f 2>/dev/null || true
sleep 2
echo "After:" && uptime
echo "Remaining build processes: $(ps aux | grep -E 'vite build|buildx build -f app/Dockerfile|docker-build.sh' | grep -v grep | wc -l)"
docker ps --filter name=buildingculture --format '{{.Names}} {{.Status}}' 2>/dev/null || true
REMOTE
echo "==> Done. Run deploy only once: DEPLOY_HOST=$HOST ./scripts/deploy-ssh.sh"
