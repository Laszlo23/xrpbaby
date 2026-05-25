# Farcaster Mini App — Publishing

## Domain

Permanent mini app domain: **mini.buildingcultureid.space**

## Before you publish

1. DNS: `A` record `mini` → your server IP (`187.124.18.204`)
2. Deploy the app and confirm:
   - `https://mini.buildingcultureid.space/`
   - `https://mini.buildingcultureid.space/.well-known/farcaster.json`
3. Enable **Developer Mode** in Farcaster: https://farcaster.xyz/~/settings/developer-tools

## Account association (required for verified app)

1. Open https://farcaster.xyz/~/developers/new
2. Enter domain: `mini.buildingcultureid.space` (no `https://`)
3. Sign the message with your Farcaster custody wallet
4. Copy the `accountAssociation` object into:
   - `src/routes/.well-known/farcaster[.]json.ts`, or
   - [Hosted manifest](https://farcaster.xyz/~/developers/mini-apps/manifest) (recommended)

Redeploy after updating `accountAssociation`.

## Environment

```env
VITE_MINI_APP_ORIGIN=https://mini.buildingcultureid.space
VITE_FARCASTER_ACCOUNT_FID=<your @buildingcultu3 fid>
VITE_QUEST_HASHTAG=BuildingCulture
```

## D1 database (quest progress)

On the server after deploy:

```bash
cd /var/www/buildingcultureid/dist/server
npx wrangler d1 migrations apply culture-layer-mini --local
```

## Test in Warpcast

1. Open the mini app URL inside Warpcast
2. Confirm splash dismisses (app calls `sdk.actions.ready()`)
3. Complete a quest and verify XP updates

## App store / discovery

Share a cast with your mini app URL or submit via Farcaster developer tools once manifest is verified.
