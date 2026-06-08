#!/usr/bin/env bash
# Deprecated: apps/eco SPA removed. Eco content lives in the unified app at /earth and /guide.
#
# Use nginx 301 from eco.buildingcultureid.space → app.buildingcultureid.space/earth
# Deploy the unified app instead:
#   ./scripts/sync-deploy-env.sh && ./scripts/deploy-ssh.sh
set -euo pipefail
echo "error: apps/eco was removed. Deploy app/ and route eco.buildingcultureid.space → /earth via nginx." >&2
echo "See docs/DOMAIN_CUTOVER.md and infra/nginx-unified-entry.example.conf" >&2
exit 1
