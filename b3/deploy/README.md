# Phase 1 — single-VPS deployment runbook

Docker path for **Postgres + Strapi + web (SSR) + agent-runtime + chain indexer**, with services bound to **loopback** on the host. Terminate TLS and route public DNS with **`nginx.conf.example`** (or Caddy).

## Prerequisites

- Docker Engine + Compose v2
- A filled **`deploy/.env`** (copy from **`.env.example`**)
- For the **web** image, Vite bakes `VITE_*` at build time — sync **`deploy/.env` → `frontend/.env`** before building

## 1. Configure environment

```bash
cd b3/deploy
cp .env.example .env
# Edit .env: Postgres password, Strapi secrets (APP_KEYS, JWT_SECRET, …), CORS_ORIGIN, SIWE_ALLOWED_DOMAINS, RPC URLs, AGENTS_PAUSED=1, ECON_LIVE=0
```

Copy the same file (or the relevant subset) to the frontend build context:

```bash
cp .env ../frontend/.env
```

## 2. Build the web image

The frontend Dockerfile expects **`frontend/.env`** (via `scripts/docker-build.sh`, which stages `docker/dotenv-for-build`):

```bash
cd ../frontend
./scripts/docker-build.sh
# produces buildingculture-frontend:latest by default (override IMAGE_NAME)
```

## 3. Build the rest of the stack

From **`b3/deploy`**:

```bash
docker compose build strapi agent-runtime indexer
```

Or build individually from **`b3/`**:

```bash
docker build -f strapiapp/Dockerfile -t buildingculture-strapi:latest .
docker build -f packages/agent-runtime/Dockerfile -t buildingculture-agent-runtime:latest .
docker build -f deploy/Dockerfile.indexer -t buildingculture-indexer:latest .
```

## 4. Database migrations

The **web** container entrypoint runs **`npx prisma migrate deploy`** automatically when `DATABASE_URL` is set.

For a **one-shot migrate** from the host (optional):

```bash
cd ../frontend
export DATABASE_URL="postgresql://USER:PASS@127.0.0.1:5432/DB?schema=public"
npx prisma migrate deploy
```

## 5. Start compose

```bash
cd ../deploy
docker compose --env-file .env up -d
```

Nginx (host) should proxy:

- `app.<domain>` → `127.0.0.1:3000`
- `api.<domain>` → `127.0.0.1:1337`

## 6. Push / rsync (operators)

- **Registry**: tag images (`docker tag …`) and `docker push` to your registry; set `STRAPI_IMAGE`, `WEB_IMAGE`, etc. in `.env` on the server.
- **rsync**: copy this repo to the VPS, build there, or rsync built images with `docker save` / `docker load`.

## Strapi — first boot checklist

1. **`community_wallet_nonces` (SIWE)** — On every boot, Strapi bootstrap runs `ensureWalletNonceTable` (`strapiapp/src/utils/wallet-nonce-table.js`), creating the table when missing. Verify in Postgres:

   ```sql
   SELECT tablename FROM pg_tables WHERE tablename = 'community_wallet_nonces';
   ```

2. **`narrowPublicCmsPermissions`** — Runs on bootstrap (`strapiapp/src/bootstrap.js`) and removes legacy public reads on CMS types **after** seed data exists. On a fresh production DB, run the example seed **once**:

   ```bash
   docker compose exec strapi sh -c 'cd /app && npm run seed:example -w buildingculture-strapi'
   ```

   (Or run `npm run seed:example` from `b3/strapiapp` during provisioning.) Then confirm in Strapi Admin → Settings → Users & Permissions → Public — only the intended routes remain public.

3. **SIWE v3** — `siwe@^3` is declared in `strapiapp/package.json`. The wallet controller uses `SiweMessage.fromMessage` when available (`community-profile.js`).

## Contract address sync (operator)

After redeploying contracts, follow **`POST_REDEPLOY_SYNC.md`**.

## Pre-launch gate

Before **`ECON_LIVE=1`**, complete **`VERIFY_GATE.md`**.

## Troubleshooting

- **Strapi won’t start** — check `DATABASE_CLIENT=postgres` and `DATABASE_URL` reaching the `postgres` service hostname from the Strapi container.
- **Indexer errors** — ensure `VITE_AGENT_SHARE_CAMPAIGN_ADDRESS` (or deployments baked into `@bc/contracts-sdk`) and `BASE_RPC_URL` / `DATABASE_URL` are set in `.env` consumed by the indexer service.
- **Agent ticks** — keep `AGENTS_PAUSED=1` until the fleet is verified; see `ops/AGENT_PHASE0.md`.
