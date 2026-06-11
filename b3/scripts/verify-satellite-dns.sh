#!/usr/bin/env bash
# Verify satellite DNS A records point at the BC VPS before nginx/TLS install.
set -euo pipefail

VPS_IP="${VPS_IP:-187.124.18.204}"
HOSTS=(
  wohnai.buildingcultureid.space
  ankommen.buildingcultureid.space
  forkids.buildingcultureid.space
  mini.buildingcultureid.space
  miniapp.buildingcultureid.space
)

echo "Satellite DNS check (expected A → $VPS_IP)"
echo ""
fail=0

for host in "${HOSTS[@]}"; do
  ips=$(dig +short A "$host" 2>/dev/null | tr '\n' ' ' | sed 's/ $//')
  if [[ -z "$ips" ]]; then
    echo "MISSING  $host  (add A record → $VPS_IP)"
    fail=1
  elif echo "$ips" | grep -q "$VPS_IP"; then
    echo "OK       $host → $ips"
  else
    echo "WRONG    $host → $ips (expected $VPS_IP)"
    fail=1
  fi
done

echo ""
echo "Required DNS records (registrar / Cloudflare):"
for host in ankommen.buildingcultureid.space forkids.buildingcultureid.space mini.buildingcultureid.space; do
  echo "  A  $host  →  $VPS_IP"
done
echo "  (wohnai + miniapp may already exist)"

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "All satellite DNS records OK."
