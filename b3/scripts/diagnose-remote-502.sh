#!/usr/bin/env bash
# Run from laptop against the VPS — checks Docker app port + recent logs (502 triage).
# Usage: DEPLOY_HOST=user@ip ./scripts/diagnose-remote-502.sh
set -euo pipefail
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
APP_PORT="${APP_PORT:-3010}"

ssh -o BatchMode=yes "$HOST" bash -s -- "$REMOTE_DIR" "$APP_PORT" <<'REMOTE'
set -euo pipefail
RDIR="$1"
PORT="$2"
echo "=== docker compose (project dir: $RDIR) ==="
cd "$RDIR" 2>/dev/null || { echo "missing $RDIR"; exit 1; }
docker compose -f docker-compose.stack.yml ps -a 2>/dev/null || true
echo ""
echo "=== compose projects ==="
docker compose ls 2>/dev/null || true
echo ""
echo "=== containers matching buildingculture / postgres (compose name) ==="
docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -iE 'buildingculture|postgres' || echo "(none — stack probably not started)"
echo ""
echo "=== listeners on :$PORT (expect 127.0.0.1) ==="
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -E ":${PORT}\\s|:${PORT}\$" || echo "(nothing listening on $PORT — nginx will 502)"
echo ""
echo "=== curl upstream (bypasses nginx) ==="
curl -sS -o /dev/null -w "HTTP %{http_code} time %{time_total}s\n" --max-time 5 "http://127.0.0.1:${PORT}/" || echo "curl failed — app not reachable on 127.0.0.1:${PORT}"
echo ""
echo "=== last 80 lines: web container logs ==="
docker compose -f docker-compose.stack.yml logs web --tail 80 2>/dev/null || docker logs "$(docker ps -aq --filter name=buildingculture-web --filter name=web | head -1)" --tail 80 2>/dev/null || echo "(no compose logs — try: docker ps -a)"
REMOTE
