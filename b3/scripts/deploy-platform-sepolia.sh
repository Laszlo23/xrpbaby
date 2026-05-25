#!/usr/bin/env bash
# Deploy BCD + CulturePulseAnchor on Base Sepolia (84532).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> BCD token + genesis claim"
"$ROOT/scripts/deploy-bcd-base-sepolia.sh"

echo ""
echo "==> Culture Pulse anchor"
export PULSE_ATTEST_CHAIN_ID=84532
"$ROOT/scripts/deploy-pulse-anchor.sh"

echo ""
echo "Done. Update app/.env from contracts/deployments/84532.json and set:"
echo "  PULSE_ANCHOR_ADDRESS=<CulturePulseAnchor>"
echo "  VITE_BCD_CHAIN_ID=84532"
