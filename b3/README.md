# Building Culture — monorepo (`b3`)

One app, one story: bring places back to life with community, drops, and onchain participation.

## Where to go (production)

| URL | What you get |
|-----|----------------|
| [app.buildingcultureid.space/](https://app.buildingcultureid.space/) | Story landing — who we are |
| `/play` | Drops & rewards (RWA tickets, Play home) |
| `/join` | Create your pass (wallet sign-in) |
| `/forest` | Your community hub — stats, quests, modules |
| `/signal` | Culture Pulse — live transparency feed |

Legacy hosts (`0x.buildingculture.capital`, `app.buildingculture.capital`) redirect to the unified app during cutover. See [docs/DOMAIN_CUTOVER.md](docs/DOMAIN_CUTOVER.md).

## Layout

| Path | Role |
|------|------|
| [`app/`](app/) | **Main TanStack app** — landing, wallet, drops, marketplace, forest hub |
| [`cms/`](cms/) | Strapi CMS (blog, roadmap, community profiles) |
| [`contracts/`](contracts/) | BCD and campaign Solidity |
| [`packages/`](packages/) | Shared `@bc/*` libraries |
| [`deploy/`](deploy/) | Production Docker stack |
| [`docs/`](docs/) | Runbooks — start at [docs/README.md](docs/README.md) |
| [`onboarding/`](onboarding/) | **Deprecated** CRA landing — do not deploy; see [onboarding/DEPRECATED.md](onboarding/DEPRECATED.md) |

Satellite apps (`apps/founding`, `apps/art`, `apps/identity`, etc.) merge into `app/` over time.

## Quick start (local)

```bash
npm install
npm run db:start               # Docker Postgres on :55432 + migrations
npm run dev:platform           # db + migrate + dev → http://localhost:5173
```

Open:

- **Story:** http://localhost:5173/
- **Play (drops):** http://localhost:5173/play
- **Join:** http://localhost:5173/join
- **Community hub:** http://localhost:5173/forest
- **Culture Pulse:** http://localhost:5173/signal

```bash
npm run dev:healthcheck        # verify server + API
npm --prefix cms run develop   # Strapi :1337 (optional)
cd contracts && forge test
```

## Tests

From `app/`:

```bash
npm run test:unit              # server unit tests
npm run test:smoke             # Playwright (build + production SSR)
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

See [app/README.md](app/README.md) and [app/MANUAL_QA_CHECKLIST.md](app/MANUAL_QA_CHECKLIST.md).

## Docs

- [Platform voice](docs/PLATFORM_VOICE.md)
- [Domain cutover](docs/DOMAIN_CUTOVER.md)
- [Missing & fixes tracker](docs/MISSING_AND_FIXES.md)
- [App ops](app/AGENTS.md)
