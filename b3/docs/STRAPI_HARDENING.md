# Strapi hardening (implemented in-repo)

| Control | Implementation |
|--------|------------------|
| Durable wallet nonces | `community_wallet_nonces` table (`src/utils/wallet-nonce-table.js`) |
| SIWE (EIP-4361) | `community-profile` `walletNonce` / `walletVerify` using `siwe` |
| `/wallet/*` rate limit | `src/middlewares/wallet-rate-limit.js` (40 req / IP / minute) |
| Production CORS | `CORS_ORIGIN` required when `NODE_ENV=production`; no `*` fallback |
| Narrow public CMS | `narrowPublicCmsPermissions` removes anonymous `article`/`author`/`category`/`global`/`about` reads |

## Environment

- `SIWE_ALLOWED_DOMAINS` — comma-separated hostnames allowed in SIWE messages (e.g. `app.buildingculture.capital`).
- `WALLET_AUTH_CHAIN_IDS` — defaults to `8453` (Base).
- `STRAPI_API_TOKEN` — use for server-to-server reads (e.g. `/docs` in the frontend).
