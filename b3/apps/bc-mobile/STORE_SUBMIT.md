# Store submission — Building Culture

Native projects are ready at `apps/bc-mobile/`. Submission requires your developer accounts.

## Pre-flight

```bash
# From repo root
npm run mobile:sync
```

Confirm on a physical device:

```bash
cd apps/bc-mobile
npm run run:android   # or run:ios
```

Privy: complete [PRIVY_CHECKLIST.md](./PRIVY_CHECKLIST.md).

## Google Play

### 1. Build release AAB

Requires JDK 17+ and Android SDK (Android Studio).

```bash
npm run mobile:android
# Output: apps/bc-mobile/android/app/build/outputs/bundle/release/app-release.aab
```

### 2. Play Console

1. [play.google.com/console](https://play.google.com/console) → Create app
2. **Package name:** `space.buildingcultureid.app` (must match `applicationId`)
3. Upload `app-release.aab` → Production (or internal testing first)
4. **Store listing:**
   - Short description: culture identity, drops, marketplace on Base
   - Full description: link to `https://app.buildingcultureid.space`
   - Privacy policy: `https://app.buildingcultureid.space/legal/privacy`
   - Screenshots: `/join`, `/forest`, `/play`, `/marketplace`
5. **Data safety:** declare email (Privy), wallet address, optional analytics (PostHog if enabled)
6. **Content rating** questionnaire
7. Submit for review (typically 1–3 days)

### Signing note

First release: Play App Signing is recommended. Generate upload keystore:

```bash
keytool -genkey -v -keystore bc-upload.keystore -alias bc -keyalg RSA -keysize 2048 -validity 10000
```

Configure `android/app/build.gradle` `signingConfigs` before production upload (not committed — use env or `keystore.properties`).

## Apple App Store

### 1. Open Xcode

```bash
npm run mobile:ios
```

### 2. Signing

- Team: your Apple Developer account
- Bundle Identifier: `space.buildingcultureid.app`
- Automatically manage signing (or manual profiles)

### 3. Archive

1. Select **Any iOS Device (arm64)**
2. Product → Archive
3. Distribute App → App Store Connect → Upload

### 4. App Store Connect

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → New App
2. **Bundle ID:** `space.buildingcultureid.app`
3. **Privacy policy URL:** `https://app.buildingcultureid.space/legal/privacy`
4. **Screenshots** (6.7" iPhone 15 Pro Max required; optional iPad)
5. **App Review notes:** app loads `https://app.buildingcultureid.space` in WebView; crypto wallet optional; test account if needed
6. Export compliance: uses HTTPS only, no custom encryption beyond standard TLS
7. Submit (review typically 1–7 days)

## Version bumps

Edit before each store release:

| File | Field |
|------|-------|
| `android/app/build.gradle` | `versionCode`, `versionName` |
| Xcode → App target | `CURRENT_PROJECT_VERSION`, `MARKETING_VERSION` |

Web-only changes do **not** require a new store build (remote URL mode).

## CI (optional)

For automated AAB builds, add a workflow with:

- `actions/setup-java@v4` (temurin 17)
- `android-actions/setup-android@v3`
- `./scripts/build-bc-mobile.sh android`

iOS CI requires macOS runners + signing certificates (match or App Store Connect API key).
