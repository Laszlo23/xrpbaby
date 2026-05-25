# Staging checklist — BUILDCHAIN web app (`b3/frontend`)

Use before pointing DNS or traffic at a **staging** host. Mirrors CI (`frontend.yml`) plus wallet and chain checks CI cannot fully cover.

## 1. Build and automated gates (match CI)

From repo root `b3/`:

```bash
npm ci
npm --prefix frontend run test:all
```

(`test:all` in `frontend/` runs **verify**, **unit tests**, then **Playwright smoke** — including SEO/API routes.)

Playwright starts its own production server (`build` + `start`). If port **3000** is already taken by another process, either free it or set **`PLAYWRIGHT_REUSE_SERVER=1`** only when that process is the same SSR stack — otherwise server routes (`/sitemap.xml`, `/api/*`) may 404 while pages still appear to load (SPA fallback).

`verify` = **lint + typecheck + build**. Same sequence runs in GitHub Actions when `frontend/` or `packages/` change.

Ensure **Prisma** applies cleanly against staging DB:

```bash
cd frontend && DATABASE_URL="postgresql://…" npx prisma migrate deploy
```

## 2. Environment parity

- Copy from [`frontend/.env.example`](frontend/.env.example); fill **staging-specific** RPC URLs, `DATABASE_URL`, Strapi, OAuth, `VITE_*` where the staging URL differs from local.
- **Docker / production builds:** `VITE_*` is baked at **image build time** — rebuild the image after changing client-visible vars ([`Dockerfile`](frontend/Dockerfile)).
- Server-only secrets stay **out** of `VITE_*` ([`AGENTS.md`](../frontend/AGENTS.md)).

## 3. Smoke checklist (browser)

After deploy, hit staging origin over **HTTPS**:

| Check | Pass criteria |
|-------|----------------|
| Home | `/` renders |
| Core routes | `/marketplace`, `/profile`, `/presale`, `/mission`, `/agent-fleet` render |
| APIs | `OPTIONS /api/x402/premium` → 204; `GET /.well-known/farcaster.json` OK; `GET /.well-known/agent.json` OK |

Automated equivalents live in [`frontend/e2e/smoke.spec.ts`](../frontend/e2e/smoke.spec.ts).

## 4. Web3 manual pass (staging wallet)

Use a **dedicated test wallet** with limited funds.

| Check | Notes |
|-------|--------|
| Chain | App prompts or defaults to **intended chain** (e.g. Base per `VITE_BCD_CHAIN_ID` / wallet config). |
| Connect | Wallet connects without console errors. |
| Read path | Token/NFT balance or mission UI loads without RPC timeout (watch Infura/Alchemy quotas). |
| Write path | One **low-risk** tx if applicable (e.g. claim disabled on staging until safe). |

Record **chain id**, **RPC provider**, and **contract addresses** used (`VITE_*` / SDK — see [`packages/contracts-sdk`](../packages/contracts-sdk)).

## 5. Contracts / chain facts (optional script)

For BCD on Base, run [`scripts/verify-bcd-base-onchain.sh`](../scripts/verify-bcd-base-onchain.sh) (requires `cast`) and compare to [`docs/BCD_PAYER_WALLET.md`](BCD_PAYER_WALLET.md).

## 6. Rollback

- Keep previous container image tag / git tag deployable.
- DB: avoid destructive migrations without backup; document `prisma migrate` direction if rollback needed.

## Related

- Ops: [`frontend/AGENTS.md`](../frontend/AGENTS.md), [`deploy-ssh.sh`](../scripts/deploy-ssh.sh), [`docker-compose.stack.yml`](../frontend/docker-compose.stack.yml)
- CI: [`.github/workflows/frontend.yml`](../.github/workflows/frontend.yml)
