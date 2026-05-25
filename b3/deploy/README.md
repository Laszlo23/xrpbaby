# Phase 1 — single-VPS deployment runbook

Docker path for **Postgres + Strapi + web (SSR) + agent-runtime + chain indexer**, with services bound to **loopback** on the host. Terminate TLS and route public DNS with **`infra/nginx-unified-entry.example.conf`** (or Caddy).

## Prerequisites

- Docker Engine + Compose v2
- A filled **`deploy/.env`** (copy from **`.env.example`**)
- For the **web** image, Vite bakes `VITE_*` at build time — run **`./scripts/sync-deploy-env.sh`** before building

## 1. Configure environment

```bash
cd b3/deploy
cp .env.example .env
# Edit .env: Postgres password, Strapi secrets (APP_KEYS, JWT_SECRET, …), CORS_ORIGIN, SIWE_ALLOWED_DOMAINS, RPC URLs, AGENTS_PAUSED=1, ECON_LIVE=0
cd ..
./scripts/sync-deploy-env.sh
```

## 2. Build the web image

The app Dockerfile expects **`app/.env`** (via `scripts/docker-build.sh`, which stages `docker/dotenv-for-build`):

```bash
cd b3
./app/scripts/docker-build.sh
# produces buildingculture-frontend:latest by default (override WEB_IMAGE)
```

## 3. Build the rest of the stack

From **`b3/deploy`**:

```bash
docker compose build strapi agent-runtime indexer
```

Or build individually from **`b3/`**:

```bash
docker build -f cms/Dockerfile -t buildingculture-strapi:latest .
docker build -f packages/agent-runtime/Dockerfile -t buildingculture-agent-runtime:latest .
docker build -f deploy/Dockerfile.indexer -t buildingculture-indexer:latest .
```

## 4. Database migrations

The **web** container entrypoint runs **`npx prisma migrate deploy`** automatically when `DATABASE_URL` is set.

For a **one-shot migrate** from the host (optional):

```bash
cd b3/app
export DATABASE_URL="postgresql://USER:PASS@127.0.0.1:5432/DB?schema=public"
npx prisma migrate deploy
```

## 5. Start compose

```bash
cd b3/deploy
docker compose --env-file .env up -d
```

Nginx (host) should proxy:

- `app.<domain>` or apex → `127.0.0.1:3000`
- `api.<domain>` → `127.0.0.1:1337`

## 6. Remote deploy (rsync + compose)

```bash
export DEPLOY_HOST=user@your.vps
cp deploy/.env.example deploy/.env   # once, edit secrets
./scripts/deploy-full-stack.sh
```

## Strapi — first boot checklist

1. **`community_wallet_nonces` (SIWE)** — On every boot, Strapi bootstrap runs `ensureWalletNonceTable` (`cms/src/utils/wallet-nonce-table.js`), creating the table when missing.

2. **Seed + API token** — On a fresh production DB:

   ```bash
   docker compose exec strapi sh -c 'cd /app/cms && node scripts/ensure-roadmap-seed.js && node scripts/ensure-api-token.js'
   ```

   Copy the printed `STRAPI_API_TOKEN` into `deploy/.env`, re-run `./scripts/sync-deploy-env.sh`, rebuild web, and `docker compose up -d web`.

3. **SIWE v3** — `siwe@^3` in `cms/package.json`; wallet controller uses `SiweMessage.fromMessage` when available.

## Contract address sync (operator)

After redeploying contracts, follow **`POST_REDEPLOY_SYNC.md`**.

## Pre-launch gate

Before **`ECON_LIVE=1`**, complete **`VERIFY_GATE.md`**.

## Troubleshooting

- **Strapi won’t start** — check `DATABASE_CLIENT=postgres` and `DATABASE_URL` reaching the `postgres` service hostname from the Strapi container.
- **Indexer errors** — ensure `VITE_AGENT_SHARE_CAMPAIGN_ADDRESS` (or deployments baked into `@bc/contracts-sdk`) and `BASE_RPC_URL` / `DATABASE_URL` are set in `.env` consumed by the indexer service.
- **Agent ticks** — keep `AGENTS_PAUSED=1` until the fleet is verified; see `ops/AGENT_PHASE0.md`.
