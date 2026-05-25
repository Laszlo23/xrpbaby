# Agent / ops reference — Building Culture app (`app/`)

## Database

- **Engine:** PostgreSQL (Prisma). Schema in `prisma/schema.prisma`; migrations in `prisma/migrations/`.
- **Unified models:** `Member`, `ActivityEvent`, `RewardGrant`, `WaitlistEntry` plus `Wallet` / `PointLedger`.
- **Runtime:** `DATABASE_URL` must be available to the Node SSR process. `src/server/db/prisma.ts` returns `null` when unset.
- **Production:** `docker-compose.stack.yml` (Postgres + web). Entrypoint runs `prisma migrate deploy` before serve.
- **Deploy:** From repo root `b3/`, `./scripts/deploy-ssh.sh` rsyncs `app/`, builds on server, `docker compose -f app/docker-compose.stack.yml up -d`.

## Platform API

| Route | Role |
|-------|------|
| `POST /api/platform/waitlist` | Landing email capture → Postgres |
| `POST /api/platform/analytics` | Activity events from onboarding |
| `POST /api/platform/onboarding-complete` | Link wallet + welcome Culture Points |

## Onboarding routes

| Path | Role |
|------|------|
| `/welcome` | In-app welcome (port of marketing story) |
| `/join` | Smart wallet + intent quiz |
| `/forest` | Module hub |

## BCD

- **`VITE_BCD_CHAIN_ID`:** `8453` mainnet, `84532` Base Sepolia staging.
- Deploy Sepolia: `scripts/deploy-bcd-base-sepolia.sh` then `npm run contracts:sdk`.

## Strapi CMS

Backed by **`../cms`**. See **`../cms/AGENTS.md`** if present and `../cms/data/api-inventory.json`.

## Tests

`npm run test:all` — verify → unit → Playwright smoke.
