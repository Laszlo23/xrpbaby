#!/usr/bin/env bash
# Deprecated: apps/hub SPA removed. Landing lives in the unified app at /.
#
# Use nginx 301 from home.buildingcultureid.space → app.buildingcultureid.space/
# Deploy the unified app instead:
#   ./scripts/sync-deploy-env.sh && ./scripts/deploy-ssh.sh
set -euo pipefail
echo "error: apps/hub was removed. Deploy app/ and route home.buildingcultureid.space → / via nginx." >&2
echo "See docs/DOMAIN_CUTOVER.md and infra/nginx-unified-entry.example.conf" >&2
exit 1
