# World App Mini App + World Chain

This repo integrates [**MiniKit JS**](https://docs.world.org/mini-apps/quick-start/installing) (`@worldcoin/minikit-js`) for experiences opened inside **World App**, plus optional **World Chain** (chain id **480**) in the wagmi wallet list.

## Code layout

| Piece | Location |
|-------|-----------|
| MiniKit + wagmi fallback | [`frontend/src/components/Web3Provider.tsx`](../frontend/src/components/Web3Provider.tsx) (`MiniKitProvider`, `wagmi-fallback` import) |
| World App wagmi connector | [`frontend/src/lib/wagmi-config.ts`](../frontend/src/lib/wagmi-config.ts) (`worldApp()` first in connector list) |
| Server SIWE | [`frontend/src/routes/api/world/wallet-nonce.tsx`](../frontend/src/routes/api/world/wallet-nonce.tsx), [`wallet-verify.tsx`](../frontend/src/routes/api/world/wallet-verify.tsx) |
| Verification logic | [`frontend/src/server/world/verify-world-wallet.ts`](../frontend/src/server/world/verify-world-wallet.ts) (`verifySiweMessage` from `@worldcoin/minikit-js/siwe`) |
| Optional “Verify World session” UI | [`frontend/src/components/WorldWalletSiweButton.tsx`](../frontend/src/components/WorldWalletSiweButton.tsx) (shown only when MiniKit reports installed) |
| World Chain definition | [`frontend/src/lib/chains.ts`](../frontend/src/lib/chains.ts) (`worldChain`, `includeWorldChainInWallet`) |

## Environment variables

Client (`VITE_*`):

| Variable | Purpose |
|----------|---------|
| `VITE_WORLD_MINI_APP_ID` | Mini App ID from the [World Developer Portal](https://developer.worldcoin.org/) — passed to `MiniKit.install` via `MiniKitProvider`. Optional for local web; set for production Mini App builds. |
| `VITE_WORLD_CHAIN_RPC_URL` | HTTP RPC for World Chain — overrides default gateway in `chains.ts`. |
| `VITE_ENABLE_WORLD_CHAIN` | Set to `0` to **omit** World Chain from the wagmi chain list (default: include). |

## Listing in the World App catalog

Store submission is handled in **World’s developer portal**, not in git. Typical inputs:

- **Live HTTPS URL** of this frontend (same origin as Mini App embed).
- **App name, icons, description**, privacy policy URL (your `/legal/privacy` or hosted policy).
- **Mini App ID** aligned with `VITE_WORLD_MINI_APP_ID`.

Follow the latest checklist at [World Mini Apps docs](https://docs.world.org/mini-apps/). Deep links and review criteria change over time.

## Manual QA

1. Build and deploy with `VITE_WORLD_MINI_APP_ID` set.
2. Open the app **inside World App** (not only Safari/Chrome) and confirm **World App** connector + optional **Verify World session** succeed against `/api/world/wallet-nonce` and `/api/world/wallet-verify`.
3. Confirm transactions intended on World Chain use chain **480** when that network is selected in the wallet.

## Related

- [World wallet authentication](https://docs.world.org/mini-apps/commands/wallet-auth)
- [Staging checklist](STAGING_CHECKLIST.md)
