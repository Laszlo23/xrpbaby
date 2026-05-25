#!/usr/bin/env bash
# Copy storyline + property photography from the Building Culture ogchain repo into this app's public/.
#
#   export OGCHAIN_ROOT=/path/to/ogchain   # default: $HOME/ogchain
#   ./scripts/sync-public-assets-from-ogchain.sh
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ECORWA="$(cd "$SCRIPT_DIR/.." && pwd)"
OGCHAIN="${OGCHAIN_ROOT:-$HOME/ogchain}"
PUB="$OGCHAIN/web/public"
JAG="$OGCHAIN/jagdschloss"

if [[ ! -d "$PUB" ]]; then
  echo "error: ogchain web/public not found at $PUB"
  echo "Set OGCHAIN_ROOT to your ogchain checkout (contains web/public)."
  exit 1
fi

echo "==> Ogchain: $OGCHAIN"
echo "==> Target: $ECORWA/public/assets"

mkdir -p "$ECORWA/public/assets/place/bernhardsthal" \
  "$ECORWA/public/assets/place/bernhardsthal-vision" \
  "$ECORWA/public/assets/properties/"{berggasse,jagdschlossgasse-81,whalewatching,landmark-bernhardsthal,altes-presshaus-katzelsdorf,former-dept-store-bernhardsthal,water-side-keutschach} \
  "$ECORWA/public/assets/docs"

# --- Storyline (Hero / scenes) ---------------------------------------------
cp "$PUB/old01.jpg" "$ECORWA/public/assets/place/bernhardsthal/lagerhaus-old.jpg"
cp "$PUB/land0.jpg" "$ECORWA/public/assets/place/bernhardsthal-vision/lagerhaus-new.jpg"
cp "$PUB/land02.jpg" "$ECORWA/public/assets/place/bernhardsthal/bernhardsthal.jpg"
cp "$PUB/Innen01.jpg" "$ECORWA/public/assets/place/bernhardsthal/interior.jpg"
cp "$PUB/stadl03.jpg" "$ECORWA/public/assets/place/bernhardsthal/community.jpg"
cp "$PUB/press01.jpg" "$ECORWA/public/assets/place/bernhardsthal/lagerhaus-coworking.jpg"
cp "$PUB/cam02-2.jpg" "$ECORWA/public/assets/place/bernhardsthal-vision/lagerhaus-coworking-interior.jpg"

# --- Berggasse --------------------------------------------------------------
cp "$PUB/foto-annablau-dsc1187.jpg" "$ECORWA/public/assets/properties/berggasse/berggasse-cover.jpg"
cp "$PUB/partners/01berggasse.jpeg" "$ECORWA/public/assets/properties/berggasse/berggasse-ext-03.jpg"
cp "$PUB/t1a1366-bergasse.jpg" "$ECORWA/public/assets/properties/berggasse/berggasse-ext-01.jpg"
cp "$PUB/foto-annablau-dsc0788.jpg" "$ECORWA/public/assets/properties/berggasse/berggasse-ext-02.jpg"
for i in 01 02 03 04 05 06 07 08 09; do
  cp "$PUB/berg$i.jpg" "$ECORWA/public/assets/properties/berggasse/berggasse-int-${i}.jpg"
done
# int 10–11 use berg10 / berg11 at repo root
cp "$PUB/berg10.jpg" "$ECORWA/public/assets/properties/berggasse/berggasse-int-10.jpg"
cp "$PUB/berg11.jpg" "$ECORWA/public/assets/properties/berggasse/berggasse-int-11.jpg"

# --- Jagdschlossgasse 81 ----------------------------------------------------
cp "$PUB/partners/Jagdschlossgasse-Projekte-Intro.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-cover.jpg"
cp "$JAG/Kamera01_Variante.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-new-01.jpg"
cp "$JAG/Kamera02_Variante.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-new-02.jpg"
cp "$PUB/cam03-2.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-new-03.jpg"
cp "$PUB/CAM05.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-new-04.jpg"
cp "$PUB/CAM06.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-new-05.jpg"
cp "$JAG/Innen01.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-int-01.jpg"
cp "$JAG/Innen02.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-int-02.jpg"
cp "$JAG/Innenraum_Jagdschlossgasse_81.jpg" "$ECORWA/public/assets/properties/jagdschlossgasse-81/jagdschlossgasse-81-int-03.jpg"

# --- Whalewatching ----------------------------------------------------------
cp "$PUB/whale02.jpg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-cover.jpg"
cp "$PUB/whale01.jpg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-ext-01.jpg"
cp "$PUB/whale04.jpg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-ext-02.jpg"
cp "$PUB/whale03.jpg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-ext-03.jpg"
cp "$PUB/whale06.jpg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-ext-04.jpg"
cp "$PUB/whale05.jpg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-ext-05.jpg"
cp "$PUB/im-whalewatcher.jpeg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-int-01.jpeg"
cp "$PUB/im-whalewatcher01.jpeg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-int-02.jpeg"
cp "$PUB/imwhalewatcher003.jpeg" "$ECORWA/public/assets/properties/whalewatching/whalewatching-int-03.jpeg"

# --- LandMark Bernhardsthal -------------------------------------------------
cp "$PUB/land0.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-cover.jpg"
cp "$PUB/land01.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-ext-01.jpg"
cp "$PUB/land02.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-ext-02.jpg"
cp "$PUB/cam02-2.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-new-01.jpg"
cp "$PUB/cam03-2.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-new-02.jpg"
cp "$PUB/land03.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-ext-03.jpg"
cp "$PUB/land04.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-ext-04.jpg"
cp "$PUB/CAM05.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-new-03.jpg"
cp "$PUB/CAM06.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-new-04.jpg"
cp "$PUB/Kamera01_Variante.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-new-05.jpg"
cp "$PUB/old01.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-old-01.jpg"
cp "$PUB/old02.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-old-02.jpg"
cp "$PUB/old03.jpg" "$ECORWA/public/assets/properties/landmark-bernhardsthal/landmark-bernhardsthal-old-03.jpg"

# --- Altes Presshaus --------------------------------------------------------
cp "$PUB/press0.jpg" "$ECORWA/public/assets/properties/altes-presshaus-katzelsdorf/altes-presshaus-katzelsdorf-cover.jpg"
cp "$PUB/press01.jpg" "$ECORWA/public/assets/properties/altes-presshaus-katzelsdorf/altes-presshaus-katzelsdorf-int-01.jpg"
cp "$PUB/press02.jpg" "$ECORWA/public/assets/properties/altes-presshaus-katzelsdorf/altes-presshaus-katzelsdorf-int-02.jpg"
cp "$PUB/press03.jpg" "$ECORWA/public/assets/properties/altes-presshaus-katzelsdorf/altes-presshaus-katzelsdorf-int-03.jpg"
cp "$PUB/press04.jpg" "$ECORWA/public/assets/properties/altes-presshaus-katzelsdorf/altes-presshaus-katzelsdorf-int-04.jpg"
cp "$PUB/press05.jpg" "$ECORWA/public/assets/properties/altes-presshaus-katzelsdorf/altes-presshaus-katzelsdorf-int-05.jpg"

# --- Former department store -------------------------------------------------
cp "$PUB/old01.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-cover.jpg"
cp "$PUB/old02.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-ext-01.jpg"
cp "$PUB/old03.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-ext-02.jpg"
cp "$PUB/old04.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-ext-03.jpg"
cp "$PUB/old05.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-ext-04.jpg"
cp "$PUB/old06.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-ext-05.jpg"
cp "$PUB/old07.jpg" "$ECORWA/public/assets/properties/former-dept-store-bernhardsthal/former-dept-store-bernhardsthal-ext-06.jpg"

# --- Water Side Keutschach (PNGs + STIX line) -------------------------------
GL="$PUB/culture-land/green-lake"
cp "$GL/hero-render.png" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-cover.png"
cp "$GL/haus-sommer.png" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-new-01.png"
cp "$GL/haus-winter.png" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-new-02.png"
cp "$GL/dachdetail.png" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-new-03.png"
cp "$PUB/partners/Keutschach-am-See-1b-1.jpg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-ext-01.jpg"
cp "$PUB/STIX Wohnanlage Keutschacher See 2024-04-04_0212.jpg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-stix-01.jpg"
cp "$PUB/STIX Wohnanlage Keutschacher See 2024-04-04_0239.jpg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-stix-02.jpg"
cp "$PUB/STIX Wohnanlage Keutschacher See 2024-04-04_0257.jpg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-stix-03.jpg"
cp "$PUB/STIX Wohnanlage Keutschacher See 2024-04-04_0312.jpg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-stix-04.jpg"
cp "$PUB/STIX Wohnanlage Keutschacher See 2024-04-04_0320.jpg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-stix-05.jpg"
cp "$PUB/partners/keutschachamsee011.jpeg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-ext-02.jpeg"
cp "$PUB/partners/keutschachamsee.jpeg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-ext-03.jpeg"
cp "$PUB/partners/keutschach-am-see.jpeg" "$ECORWA/public/assets/properties/water-side-keutschach/water-side-keutschach-ext-04.jpeg"

# --- Document previews (PDF page thumbnails) -------------------------------
rsync -a --delete "$PUB/extracted/" "$ECORWA/public/assets/docs/"

# STIX / partner stills can be 80MB+ JPEGs — cap longest edge for web + git weight (macOS `sips`).
if command -v sips >/dev/null 2>&1; then
  echo "==> Downscaling property JPEGs >5MB (max edge 2400px)"
  find "$ECORWA/public/assets/properties" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -size +5M -print0 |
    while IFS= read -r -d "" f; do
      sips -Z 2400 "$f" >/dev/null 2>&1 || true
    done
fi

echo "==> Done. Run: npm --prefix ecorwa run build"
