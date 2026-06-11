# Building Culture — Mobile (PWA + App Store / Play Store)

The unified web app at `https://app.buildingcultureid.space` ships on phones in two layers:

1. **PWA** — Add to Home Screen (no store review)
2. **Capacitor shell** — `apps/bc-mobile/` loads the live URL in a native WebView for App Store and Google Play

## Phase 1 — PWA (web deploy)

After deploying `app/`:

| Asset | Path |
|-------|------|
| Manifest | `app/public/manifest.webmanifest` |
| Service worker | `app/public/sw.js` (network-first) |
| Icons | `app/public/icons/icon-{192,512}.png`, `apple-touch-icon.png` |

Regenerate icons from brand SVG:

```bash
cd app && npm run pwa:icons
```

**Install on device**

- **Android Chrome:** menu → Install app (or automatic prompt when criteria met)
- **iOS Safari:** Share → Add to Home Screen

PWA opens at `/join` (onboarding). Bottom nav appears after joining (`/forest`, `/play`, etc.).

Verify locally:

```bash
cd app && npx playwright test e2e/pwa.spec.ts
```

## Phase 2 — Capacitor native shell

Location: [`apps/bc-mobile/`](../apps/bc-mobile/)

The shell uses **remote URL mode** — it loads `https://app.buildingcultureid.space` so SSR, Prisma APIs, and Web3 stay on the existing server. Web deploys update the store app without a new binary (unless native config changes).

### Prerequisites

| Tool | Android | iOS |
|------|---------|-----|
| Node 20+ | yes | yes |
| Android Studio + SDK | yes | — |
| Xcode 15+ | — | yes |
| CocoaPods (`brew install cocoapods`) | — | yes |
| Apple Developer ($99/yr) | — | for App Store |
| Google Play Console ($25 one-time) | for Play Store | — |

### Dev workflow

```bash
cd apps/bc-mobile
npm install
npm run copy:icons    # sync icons from app/public
npm run assets        # generate platform icons + splash
npx cap sync

# Android emulator / device
npm run open:android
# or: npm run run:android

# iOS simulator / device (macOS only)
npm run open:ios
# or: npm run run:ios
```

### Release builds

**Android AAB (Play Store):**

```bash
cd apps/bc-mobile
npx cap sync
npm run build:android:bundle
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**iOS (App Store):**

1. `npm run open:ios`
2. Xcode → Product → Archive → Distribute App
3. Upload to App Store Connect

Or use the helper script from repo root:

```bash
./scripts/build-bc-mobile.sh android   # AAB
./scripts/build-bc-mobile.sh ios       # opens Xcode
```

### Deep link auth (optional)

Custom scheme for auth hub return ([CULTURE_AUTH_FOUNDING.md](./CULTURE_AUTH_FOUNDING.md)):

```
buildingculture://auth/callback?returnPath=/forest
```

Configured in:

- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/App/App/Info.plist` (`CFBundleURLTypes`)

Login URL pattern:

```
https://app.buildingcultureid.space/auth/login?returnUrl=buildingculture://auth/callback
```

## Privy + Web3 (required before store submit)

In [Privy dashboard](https://dashboard.privy.io) for app `cmo4s85vq00z80cl47cz0qm2j`:

### Allowed origins

Add:

```
capacitor://localhost
https://localhost
https://app.buildingcultureid.space
```

Remote-URL Capacitor loads the production origin in the WebView, so Privy primarily sees `https://app.buildingcultureid.space`. Capacitor origins matter for local dev / fallback `www/`.

### Redirect URLs (if using deep-link auth)

```
buildingculture://auth/callback
```

### OAuth

- **Apple Sign In:** enable in Privy; for native shell, add bundle ID `space.buildingcultureid.app` in Apple Developer → Identifiers → Services ID if using web OAuth redirect
- **Google:** add authorized redirect URIs for production origin
- **WalletConnect:** confirm `VITE_WALLETCONNECT_PROJECT_ID` allows mobile deep links back to the WebView

### Server env (hub)

Usually unchanged for remote-URL mode. If using universal links later, extend:

```
SIWE_ALLOWED_DOMAINS=app.buildingcultureid.space,*.buildingcultureid.space
```

See `app/.env.example` keys `VITE_PRIVY_APP_ID`, `VITE_WALLETCONNECT_PROJECT_ID`.

### Device test checklist

On physical Android + iPhone with the Capacitor build:

- [ ] App launches to `/join` (or last visited route on production)
- [ ] Privy email login
- [ ] Google / Apple login
- [ ] Wallet connect (MetaMask / Rainbow deep link return)
- [ ] Bottom nav on `/forest`, `/play`
- [ ] BCC swap / pass mint smoke test on Base

## Store submission checklist

### Both stores

- [ ] App name: **Building Culture**
- [ ] Bundle ID: `space.buildingcultureid.app`
- [ ] Privacy policy: `https://app.buildingcultureid.space/legal/privacy`
- [ ] Support URL: `https://app.buildingcultureid.space/faq`
- [ ] Screenshots from `/join`, `/forest`, `/play`, `/marketplace` (6.7" + 5.5" iPhone, phone + tablet Android)
- [ ] Short description: culture identity, drops, marketplace, BCC on Base
- [ ] Category: Lifestyle or Finance (crypto disclosure if required)

### Google Play

- [ ] Upload `app-release.aab`
- [ ] Data safety form (wallet address, email if collected via Privy)
- [ ] Target API level per Play policy

### Apple App Store

- [ ] Archive from Xcode, upload to App Store Connect
- [ ] Export compliance: app uses HTTPS only to `app.buildingcultureid.space`
- [ ] If crypto/NFT features: answer App Review crypto questions accurately
- [ ] Sign in with Apple (if offering other social logins — Privy already supports Apple)

## Architecture

```
Phone home screen / Store download
        │
        ▼
┌───────────────────┐     HTTPS      ┌─────────────────────────────┐
│ Capacitor shell   │ ──────────────►│ app.buildingcultureid.space │
│ (bc-mobile)       │   WebView      │ TanStack Start + Postgres     │
└───────────────────┘                │ Privy · wagmi · APIs          │
        │                            └─────────────────────────────┘
        └── PWA path: same URL in Safari/Chrome with manifest + sw.js
```

## Related

- Web app routes: [app/README.md](../app/README.md)
- Auth hub pattern: [CULTURE_AUTH_FOUNDING.md](./CULTURE_AUTH_FOUNDING.md)
- Telegram / Farcaster mini-apps: already live at `/tg` and Farcaster manifest
