# BCDAI — ecosystem integration

[BCDAI](https://bcdai.buildingcultureid.space/) is the Building Culture **AI trading terminal** (copy trading, visual IF/THEN rules, MEV-aware routing on Base & Solana). It runs on Google Cloud Run; the canonical BC-branded URL is **`https://bcdai.buildingcultureid.space/`**.

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

When the user is on `bcdai.buildingcultureid.space`, redirect login through the central hub:

```
https://app.buildingcultureid.space/auth/login?returnUrl=https://bcdai.buildingcultureid.space/
```

If BCDAI is moved into the monorepo, use `@bc/culture-auth` `CultureSignInButton` / `useCultureWallet().signIn()` instead.

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

## Trading quotes (sugar-sdk)

For Aerodrome routing on Base (ETH↔BCC and pool discovery), run the monorepo trading agent and point BCDAI at it:

```bash
cd b3/packages/trading-agent && pip install -r requirements.txt && python -m trading_agent.server
```

See [TRADING_AGENT_SUGAR.md](./TRADING_AGENT_SUGAR.md) — `GET /quote/bcc`, `POST /quote`, unsigned swap previews when paper mode is off.

## Founding quest

Visiting BCDAI via the founding miniapp ecosystem list awards **150 XP** (`POST /api/ecosystem/visit` with `app_slug: bcdai`).
