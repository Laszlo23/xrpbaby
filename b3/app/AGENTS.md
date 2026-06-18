# Agent / ops reference — Building Culture app (`app/`)

## Database

- **Engine:** PostgreSQL (Prisma). Schema in `prisma/schema.prisma`; migrations in `prisma/migrations/`.
- **Unified models:** `Member`, `ActivityEvent`, `RewardGrant`, `WaitlistEntry` plus `Wallet` / `PointLedger`.
- **Runtime:** `DATABASE_URL` must be available to the Node SSR process. `src/server/db/prisma.ts` returns `null` when unset.
- **Production:** `docker-compose.stack.yml` (Postgres + web). Entrypoint runs `prisma migrate deploy` before serve.
- **Deploy:** From repo root `b3/`, `./scripts/deploy-ssh.sh` rsyncs `app/`, builds on server, `docker compose -f app/docker-compose.stack.yml up -d`.

## Platform API

| Route                                    | Role                                 |
| ---------------------------------------- | ------------------------------------ |
| `POST /api/platform/waitlist`            | Landing email capture → Postgres     |
| `POST /api/platform/analytics`           | Activity events from onboarding      |
| `POST /api/platform/onboarding-complete` | Link wallet + welcome Culture Points |
| `POST /api/intelligence/ingest`          | Growth Intelligence event batch      |
| `GET /api/intelligence/overview`         | GI dashboard metrics                 |
| `GET /intelligence`                      | Growth Intelligence admin dashboard  |

## Onboarding routes

| Path       | Role                                     |
| ---------- | ---------------------------------------- |
| `/welcome` | In-app welcome (port of marketing story) |
| `/join`    | Smart wallet + intent quiz               |
| `/forest`  | Module hub                               |

## BCC (Building Culture Coin)

- **Token (Base `8453`):** `0xb890a5289f789f1346032ccc1847939e855fab07` — see `docs/BCC_TOKEN.md`.
- **`VITE_BCC_TOKEN_ADDRESS`**, **`VITE_BCC_UNISWAP_URL`**, **`VITE_BCC_DISCOUNT_BPS`** in `.env.example`.
- Legacy genesis/sale env still uses `VITE_BCD_*` keys where applicable.

## Strapi CMS

Backed by **`../cms`**. See **`../cms/AGENTS.md`** if present and `../cms/data/api-inventory.json`.

## Culture Layer stack

Five-layer model (Community → Capital): sub-items, routes, and agent mapping in [`../docs/CULTURE_LAYERS.md`](../docs/CULTURE_LAYERS.md). Canonical config: `src/lib/culture-layers.ts`.

### Web3.bio identity graph

| Route | Role |
| ----- | ---- |
| `GET /api/identity/graph-demo` | Landing demo graph (`VITE_LANDING_GRAPH_IDENTITY`, default `laszloleonardo.eth`) |
| `GET /api/identity/graph` | Graph by `?address=` or `?identity=` |
| `GET /api/identity/enrich` | Full Culture Layer enrichment for `?name=handle.culture` |

- **Profile graph:** `GET https://api.web3.bio/profile/{identity}` — no API key required (rate-limited).
- **Credentials:** `GET https://api.web3.bio/credential/ethereum,{address}` — no key; used for trust badges until `WEB3BIO_API_KEY` arrives.
- **Wallet bundle:** `GET https://api.web3.bio/wallet/{address}` — requires `WEB3BIO_API_KEY`.
- **Cache:** `IdentityEnrichmentCache` (Prisma) — 6h TTL keyed by owner wallet or `identity:{name}`.
- **Smoke:** `bash scripts/identity-graph-smoke.sh [origin]`

Env: `VITE_LANDING_GRAPH_IDENTITY`, optional `WEB3BIO_API_KEY` in `app/.env`.

## Tests

`npm run test:all` — verify → unit → Playwright smoke.
