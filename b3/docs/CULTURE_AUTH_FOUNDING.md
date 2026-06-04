# Founding app — Culture Auth (phase 2)

The Expo **founding** app currently uses Neynar for Farcaster identity and has no unified Privy wallet layer.

## Recommended phase 2 options

### Option A — Privy React Native SDK

1. Add `@privy-io/expo` with the **same App ID** as web (`cmo4s85vq00z80cl47cz0qm2j`).
2. On login, call `POST https://0x.buildingculture.capital/api/wallet/sync` with the Privy access token + embedded wallet address.
3. Keep Neynar for Farcaster-specific features; wallet address comes from Culture Auth.

### Option B — Auth hub deep link

1. Open system browser or in-app WebView:  
   `https://0x.buildingculture.capital/auth/login?returnUrl=buildingculture://auth/callback`
2. Register custom URL scheme / universal link handler in Expo.
3. After redirect, satellite re-authenticates with stored session or prompts one-tap Privy resume.

## Farcaster → unified Member (implemented)

When a builder links Farcaster and has `wallet_address` on their Mongo profile, the founding backend calls:

`POST {HUB_API_ORIGIN}/api/social/link-farcaster-internal`

with header `X-Platform-Internal-Secret` (same as `PLATFORM_INTERNAL_SECRET` on the hub).

Env on founding backend:

- `HUB_API_ORIGIN` — default `https://app.buildingcultureid.space`
- `PLATFORM_INTERNAL_SECRET` — shared with hub `deploy/.env`

## Out of scope for phase 1

- Replacing Neynar Farcaster login entirely
- Full smart-wallet parity inside Warpcast mini context
- Cookie-less automatic session across mobile WebView and native without explicit hub flow

See [SMART_WALLET_AND_PACKS.md](./SMART_WALLET_AND_PACKS.md) for the web auth hub pattern.
