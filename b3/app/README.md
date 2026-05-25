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
| `/pass` | Claim your Culture Layer .tld on Base (~$1.11 in ETH) |
| `/places` | Real-estate hub — links to buildingculture.capital + wallet eligibility |
| `/investors` | Capital overview + Chainlink RWA compliance strip |
| `/id/{name}` | Culture name profile; `/n/{name}` short gateway |
| `/earth` | Earth lane — hubs and regeneration |
| `/marketplace` | ERC-721 secondary market (not property shares) |
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

Culture Layer identity (mint ~$1.11 USD in ETH on Base):

| Variable | Notes |
|----------|--------|
| `VITE_IDENTITY_CONTRACT_ADDRESS` | `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` |
| `VITE_IDENTITY_CHAIN_ID` | `8453` (Base mainnet) |

See [IDENTITY_MINT_PRICE.md](../docs/IDENTITY_MINT_PRICE.md) for on-chain updates.

Culture names resolve in-app (no ICANN spend): `/id/handle.tld`, short `/n/handle.tld`, `GET /api/identity/resolve`. See [IDENTITY_RESOLUTION.md](../docs/IDENTITY_RESOLUTION.md).

RWA / real estate compliance:

| Variable | Notes |
|----------|--------|
| `COMPLIANCE_REGISTRY_ADDRESS` | Places `ComplianceRegistry` on Base (server) |
| `VITE_PLACES_SITE_URL` | Default `https://buildingculture.capital` |
| `PROPERTY_RESERVE_FEED_ADDRESS` | Optional PoR feed |
| `CHAINLINK_ACE_COMPLIANCE_ADDRESS` | When Chainlink partner sandbox is live |

API: `GET /api/compliance/eligibility?wallet=0x…` — shared with `/places` hub.

See [CHAINLINK_RWA_COMPLIANCE.md](../docs/CHAINLINK_RWA_COMPLIANCE.md).

Global footer mounts once in `__root.tsx` (`AppFooter`); marketplace disclaimer is a `role="note"` block, not a second landmark.

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
- `e2e/` — Playwright specs (`landing`, `onboarding`, `forest`, `play`, `signal`, `shell`, `pass`, `identity-resolve`, `compliance-places`, `smoke`)

## More

- [AGENTS.md](AGENTS.md) — platform API and agent notes
- [MANUAL_QA_CHECKLIST.md](MANUAL_QA_CHECKLIST.md) — release QA matrix
- [../docs/MISSING_AND_FIXES.md](../docs/MISSING_AND_FIXES.md) — open issues tracker
