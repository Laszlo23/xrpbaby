#!/usr/bin/env bash
# Build or open Building Culture Capacitor native projects.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/apps/bc-mobile"

usage() {
  cat <<'EOF'
Usage: ./scripts/build-bc-mobile.sh <android|ios|sync>

  sync     — cap sync + regenerate icons from app/public
  android  — build release AAB for Google Play
  ios      — open Xcode for archive / App Store upload
EOF
}

cmd="${1:-}"

if [[ -z "$cmd" ]]; then
  usage
  exit 1
fi

cd "$MOBILE"

case "$cmd" in
  sync)
    npm run copy:icons
    npm run assets
    npx cap sync
    ;;
  android)
    npm run copy:icons
    npx cap sync android
    npm run build:android:bundle
    echo ""
    echo "AAB: $MOBILE/android/app/build/outputs/bundle/release/app-release.aab"
    ;;
  ios)
    npm run copy:icons
    npx cap sync ios
    npx cap open ios
    ;;
  *)
    usage
    exit 1
    ;;
esac
