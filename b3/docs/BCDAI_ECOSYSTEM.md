# BCDAI — ecosystem integration

[BCDAI](https://bcdai.buildingcultureid.space/) is the Building Culture **AI trading terminal** (copy trading, visual IF/THEN rules, MEV-aware routing on Base & Solana). It runs on Google Cloud Run; the canonical BC-branded URL is **`https://bcdai.buildingcultureid.space/`**.

Canonical ecosystem entrypoint remains **`https://app.buildingcultureid.space`**. BCDAI is a satellite surface in that ecosystem.

Infra: [`infra/nginx-bcdai-buildingcultureid.conf.example`](../infra/nginx-bcdai-buildingcultureid.conf.example) or GCP Cloud Run custom domain mapping.

## Listed in ecosystem registries

- [`app/src/lib/landing-ecosystem.ts`](../app/src/lib/landing-ecosystem.ts) — story landing `#ecosystem` + BCC orbit (9th product)
- [`onboarding/backend/server.py`](../onboarding/backend/server.py) — legacy `/api/ecosystem`
- [`apps/founding/backend/server.py`](../apps/founding/backend/server.py) — founding quest XP (`slug: bcdai`)
- Footers and marketing landings (WohnAI pattern)

## BCDAI app configuration (Cloud Run)

Until these are done, **links work** but **shared login / member sync** does not.

### 1. Shared Privy app

Use the same Privy App ID as the unified platform (`VITE_PRIVY_APP_ID` / `NEXT_PUBLIC_PRIVY_APP_ID` from [`deploy/.env.example`](../deploy/.env.example)).

In [Privy dashboard](https://dashboard.privy.io), confirm **`bcdai.buildingcultureid.space`** is in allowed domains (wildcard `*.buildingcultureid.space` may suffice).

### 2. Sign-in via auth hub (cross-origin)

When the user is on `bcdai.buildingcultureid.space`, redirect login through the central app auth route:

```
https://app.buildingcultureid.space/auth/login?returnUrl=https://bcdai.buildingcultureid.space/
```

If BCDAI is moved into the monorepo, use `@bc/culture-auth` `CultureSignInButton` / `useCultureWallet().signIn()` instead.

Note: keep auth and member-sync flows on `*.buildingcultureid.space`; do not route new traffic through legacy external domains.

Return URLs under `*.buildingcultureid.space` are allowed by [`packages/culture-auth/src/auth-hub.ts`](../packages/culture-auth/src/auth-hub.ts).

### 3. Member sync

After Privy login, POST the wallet to the platform API (same as [`packages/culture-auth/src/CultureMemberSync.tsx`](../packages/culture-auth/src/CultureMemberSync.tsx)):

```
POST https://app.buildingcultureid.space/api/wallet/sync
```

Include the Privy access token in the `Authorization` header per existing culture-auth conventions.

### 4. Optional — Buy $BCC

If BCDAI is React/Expo, mount `@bc/bcc-kit/react` `BuyBccButton` for token parity with other satellites. See [`docs/BCC_TOKEN.md`](BCC_TOKEN.md).

## Platform env (operators)

Add to [`deploy/.env`](../deploy/.env) and redeploy per [`deploy/POST_REDEPLOY_SYNC.md`](../deploy/POST_REDEPLOY_SYNC.md):

```bash
CORS_ORIGIN=...,https://bcdai.buildingcultureid.space
SIWE_ALLOWED_DOMAINS=...,bcdai.buildingcultureid.space
```

## Trading quotes (platform API — not raw Python port)

BCDAI must call the **BUILDCHAIN app** so x402 payments and attribution stay on-platform. Do **not** point BCDAI at `http://…:8765` in production.

| Use case | URL |
|----------|-----|
| Discovery | `https://app.buildingcultureid.space/api/trading/manifest` |
| Agent card | `https://app.buildingcultureid.space/.well-known/agent.json` |
| ETH→BCC quote (x402) | `GET /api/trading/quote-bcc?eth_amount=0.01` |
| Generic quote (x402) | `GET /api/trading/quote?from_token=eth&to_token=bcc&amount=0.01` |
| Arbitrage scan (x402) | `GET /api/trading/arbitrage-scan?sol_amount=1&eth_amount=0.01` |
| Swap preview (x402) | `GET /api/trading/swap-preview?from_token=…&to_token=…&amount=…&wallet=0x…` |

Paid calls: same x402 headers as the premium feed. Browser clients from `bcdai.buildingcultureid.space` need `X402_CORS_ORIGINS` (or `CORS_ORIGIN`) to include BCDAI.

**Operators** run `packages/trading-agent` as an internal worker; the app proxies via `TRADING_AGENT_URL`. See [TRADING_AGENT_SUGAR.md](./TRADING_AGENT_SUGAR.md).

## Founding quest

Visiting BCDAI via the founding miniapp ecosystem list awards **150 XP** (`POST /api/ecosystem/visit` with `app_slug: bcdai`).
