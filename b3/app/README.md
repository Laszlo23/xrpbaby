# Building Culture app (TanStack Start)

The unified web app: story landing, drops, onboarding, community hub, marketplace, and Culture Pulse.

## Routes (start here)

| Path | Plain English |
|------|----------------|
| `/` | The story — why we bring places back to life |
| `/play` | Play — drops, tickets, and rewards |
| `/join` | Get your pass — connect wallet, one sign-in |
| `/forest` | Your home — stats, quests, and open modules |
| `/signal` | Community pulse — live feed and metrics |
| `/marketplace` | Buy and browse onchain listings |
| `/profile` | Your wallet, XP, and settings |

`/welcome` redirects to `/`.

## Development

```bash
# From repo root
npm run dev:platform

# Or from app/
npm run dev
```

Requires Postgres for waitlist, onboarding, and points (`DATABASE_URL`). See `.env.example`.

## Environment (canonical production)

| Variable | Example |
|----------|---------|
| `PUBLIC_APP_ORIGIN` | `https://app.buildingcultureid.space` |
| `VITE_APP_ORIGIN` | same |
| `VITE_PLATFORM_ORIGIN` | same |
| `CORS_ORIGIN` | include unified + legacy hosts during cutover |
| `SIWE_ALLOWED_DOMAINS` | `app.buildingcultureid.space,app.buildingculture.capital,0x.buildingculture.capital` |
| `DATABASE_URL` | Postgres connection string |

Farcaster Mini App `homeUrl` opens `/` (story landing).

## Tests

```bash
npm run test:unit
npm run test:smoke          # all e2e/*.spec.ts
npm run verify              # lint + typecheck + build
```

E2E uses production SSR (`npm run build && npm run start`). See [e2e/README.md](e2e/README.md).

Optional chain tests: set `CI_WALLET_E2E=1` (documented, not in default CI).

## Key directories

- `src/components/landing/` — story landing sections
- `src/routes/` — pages and API routes
- `src/server/platform/` — waitlist, SIWE, member rewards
- `e2e/` — Playwright specs (`landing`, `onboarding`, `forest`, `play`, `signal`, `shell`, `smoke`)

## More

- [AGENTS.md](AGENTS.md) — platform API and agent notes
- [MANUAL_QA_CHECKLIST.md](MANUAL_QA_CHECKLIST.md) — release QA matrix
- [../docs/MISSING_AND_FIXES.md](../docs/MISSING_AND_FIXES.md) — open issues tracker
