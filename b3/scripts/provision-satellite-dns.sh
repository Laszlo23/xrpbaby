#!/usr/bin/env bash
# Create satellite DNS A records in Cloudflare (optional automation).
# Requires: CF_API_TOKEN, CF_ZONE_ID (buildingcultureid.space zone)
# Usage: CF_API_TOKEN=... CF_ZONE_ID=... ./scripts/provision-satellite-dns.sh
set -euo pipefail

VPS_IP="${VPS_IP:-187.124.18.204}"
TOKEN="${CF_API_TOKEN:-${CLOUDFLARE_API_TOKEN:-}}"
ZONE="${CF_ZONE_ID:-}"

if [[ -z "$TOKEN" || -z "$ZONE" ]]; then
  echo "Cloudflare credentials not set. Add these A records manually:"
  echo ""
  for sub in ankommen forkids mini miniapp; do
    echo "  A  ${sub}.buildingcultureid.space  →  $VPS_IP  (DNS only / grey cloud)"
  done
  echo ""
  echo "Then run: npm run links:verify-dns && npm run deploy:gtm-nginx"
  exit 0
fi

create_record() {
  local name="$1"
  local payload
  payload=$(cat <<EOF
{"type":"A","name":"${name}","content":"${VPS_IP}","ttl":300,"proxied":false}
EOF
)
  curl -sf -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE}/dns_records" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$payload" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  const j=JSON.parse(d);
  if(j.success) { console.log('OK  ${name}.buildingcultureid.space'); process.exit(0); }
  if(j.errors?.[0]?.message?.includes('already exists')) { console.log('SKIP ${name} (exists)'); process.exit(0); }
  console.error('FAIL ${name}', j.errors||j); process.exit(1);
});"
}

for sub in ankommen forkids mini miniapp; do
  create_record "$sub"
done

echo "DNS provisioned. Wait ~60s for propagation, then: npm run deploy:gtm-nginx"
