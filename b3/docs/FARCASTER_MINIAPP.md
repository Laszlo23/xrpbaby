# Farcaster Mini App — manifest & domain verification

Production domain: **https://app.buildingcultureid.space**

Manifest URL: **https://app.buildingcultureid.space/.well-known/farcaster.json**

## 1. Generate unsigned manifest

From `b3/app`:

```bash
PUBLIC_APP_ORIGIN=https://app.buildingcultureid.space npm run farcaster:manifest:unsigned
```

This writes `public/.well-known/farcaster.json` (miniapp metadata only — no signature yet).

Preview:

```bash
npm run farcaster:manifest
```

## 2. Sign domain ownership (you must do this in Warpcast)

1. Open **[Farcaster Mini App Manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest)** (or Warpcast → Settings → Developer → Domains).
2. Enter domain: **`app.buildingcultureid.space`**
3. Connect the Farcaster account that should own the Mini App.
4. Sign the message in your wallet / Warpcast.
5. Copy the three values: **`header`**, **`payload`**, **`signature`**.

## 3. Save the signature locally

```bash
cd b3/app
npm run farcaster:manifest -- --write-association-template
```

Edit `data/farcaster-account-association.json` and paste the three signed values (replace `PASTE_*` placeholders).

Or set env vars in `app/.env`:

```bash
FARCASTER_ACCOUNT_ASSOCIATION_HEADER=eyJ...
FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD=eyJ...
FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE=0x...
```

## 4. Deploy to the server

From `b3/` (after association file is filled in):

```bash
chmod +x scripts/deploy-farcaster-manifest.sh
PUBLIC_APP_ORIGIN=https://app.buildingcultureid.space ./scripts/deploy-farcaster-manifest.sh
```

This uploads:

- `app/public/.well-known/farcaster.json` — full signed manifest (static)
- `app/data/farcaster-account-association.json` — used by the live SSR route

Verify:

```bash
curl -s https://app.buildingcultureid.space/.well-known/farcaster.json | jq .
```

You should see both `accountAssociation` and `miniapp`.

## Notes

- The app also serves the manifest dynamically from `src/server/farcaster-manifest.ts` (reads the same association file or env).
- Optional overrides: `FARCASTER_APP_NAME`, `FARCASTER_ICON_URL`, etc. in `app/.env.example`.
- For Neynar FID gating, set `NEYNAR_API_KEY` and add the domain in the Neynar developer portal.
