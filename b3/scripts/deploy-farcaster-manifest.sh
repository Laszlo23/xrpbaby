#!/usr/bin/env bash
# Deploy signed Farcaster Mini App manifest to production.
#
# Prerequisites:
#   1. cd b3/app && npm run farcaster:manifest -- --write-association-template
#   2. Sign domain at https://farcaster.xyz/~/developers/mini-apps/manifest
#   3. Paste header/payload/signature into app/data/farcaster-account-association.json
#
# Usage (from b3/):
#   ./scripts/deploy-farcaster-manifest.sh
#   DEPLOY_HOST=user@host DEPLOY_PATH=/opt/buildingculture-frontend ./scripts/deploy-farcaster-manifest.sh
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/app"
HOST="${DEPLOY_HOST:-root@187.124.18.204}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/buildingculture-frontend}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}"
SSH=(ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes)
ASSOC_FILE="$APP/data/farcaster-account-association.json"

if [[ ! -f "$ASSOC_FILE" ]]; then
  echo "error: missing $ASSOC_FILE"
  echo "Run: cd app && npm run farcaster:manifest -- --write-association-template"
  echo "Then sign at https://farcaster.xyz/~/developers/mini-apps/manifest and paste values."
  exit 1
fi

if grep -qE 'PASTE_|REPLACE_VIA_WARPCAST' "$ASSOC_FILE"; then
  echo "error: $ASSOC_FILE still has placeholder values — sign in Warpcast first."
  exit 1
fi

echo "==> Build manifest JSON locally"
cd "$APP"
PUBLIC_APP_ORIGIN="${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}" \
  npm run farcaster:manifest -- --write public/.well-known/farcaster.json >/dev/null

echo "==> Rsync manifest + association -> $HOST:$REMOTE_DIR/app/"
"${SSH[@]}" "$HOST" "mkdir -p $REMOTE_DIR/app/public/.well-known $REMOTE_DIR/app/data"
rsync -avz -e "ssh -i $SSH_KEY -o IdentitiesOnly=yes" \
  "$APP/public/.well-known/farcaster.json" \
  "$HOST:$REMOTE_DIR/app/public/.well-known/farcaster.json"
rsync -avz -e "ssh -i $SSH_KEY -o IdentitiesOnly=yes" \
  "$ASSOC_FILE" \
  "$HOST:$REMOTE_DIR/app/data/farcaster-account-association.json"

echo "==> Ensure nginx serves signed manifest (before app proxy)"
"${SSH[@]}" "$HOST" bash -s -- "$REMOTE_DIR" <<'NGINX'
set -euo pipefail
REMOTE_DIR="$1"
CONF="/etc/nginx/sites-available/app.buildingcultureid.space"
MARKER="# bc-farcaster-manifest-static"
if grep -q "$MARKER" "$CONF"; then
  echo "nginx farcaster static block already present"
else
  python3 - "$CONF" "$REMOTE_DIR" "$MARKER" <<'PY'
import sys
from pathlib import Path
conf, remote, marker = sys.argv[1], sys.argv[2], sys.argv[3]
text = Path(conf).read_text()
block = f'''
    {marker}
    location = /.well-known/farcaster.json {{
        alias {remote}/app/public/.well-known/farcaster.json;
        default_type application/json;
        add_header Cache-Control "public, max-age=300";
    }}

'''
ssl_idx = text.index("ssl_dhparam")
loc_idx = text.index("    location / {", ssl_idx)
text = text[:loc_idx] + block + text[loc_idx:]
Path(conf).write_text(text)
print(f"Patched {conf} (HTTPS server block)")
PY
fi
nginx -t
systemctl reload nginx
NGINX

echo "==> Verify live manifest"
ORIGIN="${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}"
curl -sf "$ORIGIN/.well-known/farcaster.json" | python3 -c "
import json, sys
d = json.load(sys.stdin)
assert d.get('miniapp', {}).get('homeUrl'), 'missing miniapp.homeUrl'
assoc = d.get('accountAssociation') or {}
for k in ('header', 'payload', 'signature'):
    assert assoc.get(k), f'missing accountAssociation.{k}'
print('OK', d['miniapp']['name'], '→', d['miniapp']['homeUrl'])
print('OK accountAssociation present')
"

echo "Done. Manifest live at $ORIGIN/.well-known/farcaster.json"
