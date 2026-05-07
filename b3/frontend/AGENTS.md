# Agent / ops reference — BUILDCHAIN frontend

## Database

- **Engine:** PostgreSQL (Prisma). Schema in `prisma/schema.prisma`; migrations in `prisma/migrations/`.
- **Runtime:** `DATABASE_URL` must be available to the Node SSR process. `src/server/db/prisma.ts` returns `null` when unset (leaderboard / tasks degrade gracefully with `no_database`).
- **Production:** Prefer `docker-compose.stack.yml` (Postgres + web). The container **entrypoint runs `prisma migrate deploy`** before `node scripts/serve-production.mjs`.
- **systemd (`buildingculture-web.service`):** Ensure **`DATABASE_URL`** (and **`VITE_APP_ORIGIN`** for canonical URLs in sitemap/robots/Open Graph) appear in **`/etc/buildingculture-web.env`** (or your `EnvironmentFile=`). Without `DATABASE_URL`, leaderboards/agents degrade to `no_database` / `database_unconfigured`.
- **Deploy:** From repo root `b3/`, `./scripts/deploy-ssh.sh` rsyncs `frontend/`, builds the image on the server, then `docker compose -f docker-compose.stack.yml up -d`. Server `.env` **must** include `POSTGRES_PASSWORD` (and existing `VITE_*` / API keys).

### First-time `POSTGRES_PASSWORD` on the server

Run once over SSH (generates the secret **on the server** with OpenSSL and appends if missing):

```bash
ssh user@host 'cd /opt/buildingculture-frontend && test -f .env && { grep -q "^POSTGRES_PASSWORD=" .env || echo POSTGRES_PASSWORD=$(openssl rand -hex 24) >> .env; }'
```

Then redeploy from `b3/` with `./scripts/deploy-ssh.sh`. Prefer hex passwords from this snippet (safe in Postgres URLs). If you paste your own password, avoid `@ : /` unless you URL-encode when building `DATABASE_URL`.

## Server functions (TanStack Start)

Implemented in `src/lib/points-fns.ts` — RPC-style POST handlers backed by Prisma when DB is up:

| Export                            | Role                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| `postPointsBalance`               | Read aggregate points for an address                         |
| `postCompleteTaskWithSiwe`        | SIWE-gated one-time task reward                              |
| `postCompleteFarcasterSocialTask` | Farcaster follow/like/share tasks (Neynar)                   |
| `postLeaderboard`                 | Top wallets by points                                        |
| `postCompleteXProofTask`          | X/Twitter proof tasks                                        |
| `postCompleteTelegramProofTask`   | Telegram quest — proof URL (`t.me` / `telegram.me`) + ledger |
| `postCompleteDailyChainCheckIn`   | Daily on-chain check-in + ledger                             |

Other server logic: `src/lib/ai-pulse-fn.ts` (`postAiPulseMessage`), route handlers under `src/routes/api/`.

## Minimum env for full features

See `.env.example`: `POSTGRES_PASSWORD` + compose stack (or `DATABASE_URL` for external DB), `NEYNAR_*` for Farcaster tasks, `OPENAI_API_KEY` for coach, chain RPC vars as needed.

## Strapi CMS

Roadmap, blog, site narrative, and community profiles are backed by **`../strapiapp`**. Ops and automation should follow **`../strapiapp/AGENTS.md`** and **`../strapiapp/data/api-inventory.json`**. Server env: **`STRAPI_URL`** (backend reachable from Node); build/client: **`VITE_STRAPI_URL`** for direct reads + media URLs.
