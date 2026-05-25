# Building Culture web app

Next.js 15 app (App Router) for **Base mainnet**: browse properties, buy share tokens, **investor hub** (`/invest`), **stake** native ETH (`/stake`), **trade** (primary + AMM), **pool** liquidity (WETH + shares), **portfolio**, **onboarding**, **admin** (role-gated), KYC-aware flows, optional **WalletConnect**, and optional **proof NFT** certificates.

## Grant / demo checklist

Use this before submitting a grant or recording a demo video:

1. **Build:** `npm run build` completes with no errors.
2. **Env:** `cp .env.local.example .env.local` and fill `NEXT_PUBLIC_BASE_*` from [deployments/README.md](../deployments/README.md) (or `scripts/sync_web_env.py deployments/base-mainnet.json`).
3. **Chain:** Wallet on **Base** with ETH for gas and USDC (or issuer settlement token) for trades.
4. **Narrative:** Call out **illustrative** funding/yield UI vs **on-chain** swaps/LP — see [docs/grants.md](../docs/grants.md).
5. **Legal:** Show the in-app **Legal** page; state not investment advice in voiceover or README.

## PDF plan previews

Raster previews for plan PDFs live under `public/extracted/{documentId}/` (JPEG). Regenerate after changing PDFs or document ids:

- Install [Poppler](https://poppler.freedesktop.org/) (`brew install poppler` on macOS).
- From the repo root: `node web/scripts/export-pdf-previews.mjs`

## Setup

```bash
cd web
cp .env.local.example .env.local
# From repo root — merge Base deployment addresses:
# python3 scripts/sync_web_env.py deployments/base-mainnet.json >> web/.env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Connect** (Privy) for embedded and linked wallets, or connect via **Browser** / **WalletConnect** when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set.

**Mobile / X (Twitter) in-app browser:** embedded browsers often block wallet deep links. The app shows a **banner** suggesting you open the site in Safari or Chrome. For QR / mobile pairing, set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. Set **`NEXT_PUBLIC_SITE_URL`** to your public origin (production: `https://buildingculture.capital`) so Open Graph / X link previews resolve correctly.

## Environment variables

**Production (Docker):** `NEXT_PUBLIC_*` values are inlined at **image build** time. Copy [`.env.docker.example`](../.env.docker.example) to repo-root `.env` and run `docker compose build` (see [deployments/README.md](../deployments/README.md)).

### Privy (wallet connection)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application id — **required for the Privy Connect button**; when unset, the nav falls back to Browser / WalletConnect only (omit for CI/static builds without Privy) |
| `NEXT_PUBLIC_PRIVY_CLIENT_ID` | Optional Privy **app client** id from the dashboard; a default is applied in code when unset |
| `PRIVY_APP_SECRET` | Server-only — for Privy server SDK or REST **if** you call Privy from API routes; never prefix with `NEXT_PUBLIC_` |

Your app’s JWKS URL (`https://auth.privy.io/api/v1/apps/<app_id>/jwks.json`) is for **verifying Privy-issued JWTs on the server** (for example `Authorization: Bearer` on API routes). It is **not** passed to `PrivyProvider`.

### Base mainnet (required for production UI)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BASE_RPC` | Base JSON-RPC URL (defaults to `https://mainnet.base.org` if unset) |
| `NEXT_PUBLIC_BASE_EXPLORER` | Block explorer base (e.g. `https://basescan.org`) |
| `NEXT_PUBLIC_BASE_REGISTRY` | `PropertyRegistry` |
| `NEXT_PUBLIC_BASE_SHARE_FACTORY` | `PropertyShareFactory` |
| `NEXT_PUBLIC_BASE_COMPLIANCE_REGISTRY` | `ComplianceRegistry` |
| `NEXT_PUBLIC_BASE_WETH` | `WETH9` |
| `NEXT_PUBLIC_BASE_ROUTER` | `OgRouter` |
| `NEXT_PUBLIC_BASE_LENDING_POOL` | `SimpleLendingPool` (optional) |
| `NEXT_PUBLIC_BASE_PREDICTION_MARKET` | `BinaryPredictionMarket` |
| `NEXT_PUBLIC_BASE_PROOF_NFT` | `PropertyShareProof` |
| `NEXT_PUBLIC_BASE_STAKING` | `OgStaking` |
| `NEXT_PUBLIC_BASE_PLATFORM_TOKEN` | Settlement token when deployed |
| `NEXT_PUBLIC_BASE_PURCHASE_ESCROW_ERC20` | Escrow when deployed |
| `NEXT_PUBLIC_BASE_GUESTBOOK` | `CommunityGuestbook` (optional) |
| `NEXT_PUBLIC_BASE_GOVERNANCE_SAFE` | Protocol **Safe** multisig (display only; not an investor wallet) |

Legacy globals without `BASE_` prefix (`NEXT_PUBLIC_REGISTRY`, etc.) are **not** used by the production bundle resolution — prefer syncing **Base** addresses only.

Optional: `NEXT_PUBLIC_ENABLE_LEGACY_TESTNET=1` adds a second chain to Wagmi for internal QA (requires `NEXT_PUBLIC_OG_RPC`).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project id (optional) |
| `NEXT_PUBLIC_ADMIN_PREVIEW` | Set to `1` to show `/admin` layout without on-chain roles (staging only) |
| `NEXT_PUBLIC_SITE_URL` | Public site origin (NFT metadata `external_url`) |

**Homepage community feed:** when `DATABASE_URL` is set and `platform_posts` has rows, the landing page shows **Platform updates** from the same API as `/community`.

Server-only — Guide AI (`/guide`): `OPENAI_API_KEY`, optional `OPENAI_MODEL`. Alternatively `INFERENCE_BACKEND=og_compute` with `OG_COMPUTE_INFERENCE_URL` for custom HTTP inference backends.

**RAG + safety:** `npm run rag:build` regenerates `src/lib/rag/corpus.json` from repo markdown (runs automatically before `npm run build`). Optional `RAG_CORPUS_URL` merges remote JSON chunks. `CHAT_AUDIT_LOG=1` logs structured JSON; `CHAT_AUDIT_LOG_PATH` appends to a file (Node only). `CHAT_RAG_TOP_K`, `CHAT_RATE_LIMIT_PER_MIN` tune retrieval and rate limits.

**Risk:** `POST /api/risk/score` returns heuristic scores for admin tools. `ADMIN_RISK_WEBHOOK_URL` receives alerts when scores exceed `ADMIN_RISK_WEBHOOK_MIN_SCORE` (default 75).

**Handoff:** `SUPPORT_HANDOFF_URL` (and optional `SUPPORT_HANDOFF_SECRET`) for the Contact button and keyword-based handoff from chat.

**Community** (`/community`, `/profile`, `/u/[slug]`): requires `DATABASE_URL`, applied SQL in [`sql/`](../web/sql/README.md), and **`SESSION_SECRET`** (long random string) so SIWE sign-in can set an HttpOnly session cookie. Without these, browse listings and share links still work; profile/tasks/referrals stay disabled.

Backend (optional): `DATABASE_URL`, `RELAYER_PRIVATE_KEY`, `COMPLIANCE_REGISTRY_ADDRESS`, `KYC_WEBHOOK_SECRET` — see API routes under `src/app/api/`.

## Scripts

- `npm run dev` — development server  
- `npm run rag:build` — rebuild RAG corpus from `../docs`, `../README.md`, etc.  
- `npm run build` — `rag:build` then production build  
- `npm run lint` — ESLint  

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home + funding meter (demo stats) + trust strip |
| `/onboarding` | Wallet → KYC → deposit → invest |
| `/guide` | Checklist + optional AI assistant |
| `/community` | Platform updates, tasks, referral link (needs DB + `SESSION_SECRET`) |
| `/profile` | Edit community profile (privacy, socials) |
| `/u/[slug]` | Public profile when visibility is public |
| `/properties` | On-chain listings + demo cards |
| `/properties/[id]` | Property detail + buy CTA |
| `/trade` | Primary & secondary execution |
| `/market` | Secondary / AMM narrative + roadmap |
| `/pool` | Add/remove liquidity (WETH + property share) |
| `/portfolio` | Wallet balances + diversification (demo USD) |
| `/invest` | Investor hub: overview, property links, liquidity shortcuts |
| `/stake` | Native ETH staking, rewards, cooldown unstake |
| `/admin` | Deployment health, registrar readout, compliance `setWalletStatus` (gated by roles) |
| `/lend` | Lending pool UI |
| `/issuer` | Issuer intake form |
| `/markets` | Prediction markets |
| `/legal` | Risk / terms + grant transparency |
| `/api/nft/[tokenId]` | ERC-721 metadata JSON for proof NFTs |
