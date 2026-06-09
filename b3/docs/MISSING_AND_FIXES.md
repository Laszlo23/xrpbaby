# Missing items and fixes

Living tracker for the unified TanStack app. Update when closing or discovering gaps.

Strategic companion: [ECOSYSTEM_GOALS_AND_ROADMAP.md](./ECOSYSTEM_GOALS_AND_ROADMAP.md). Every open item below should map to an ecosystem KPI or objective.

## Fixed (2026-06-05 cleanup wave)

- Satellite SPAs removed (`apps/eco`, `apps/hub`, `apps/signal`, `onboarding/frontend`, `apps/founding/frontend`); contract trees kept at `apps/identity/contracts`, `apps/art/contracts`
- Root workspaces trimmed to `app`, `cms`, `packages/*`; legacy deploy scripts retired with redirect errors
- `.gitignore` hardened for `test-results/`, `contracts/out/`, `dist/`, generated `reports/`
- Legacy blog `posts.ts` removed; markdown loader + RSS at `/blog/feed.xml`
- Docs archived: `BLITZ_48H_WAR_ROOM`, Telegram checklists, `0G_HACKATHON_VIDEO_AND_X` → `docs/archive/`
- `npm run verify:app` green; core e2e (smoke, pass, identity-resolve, compliance-places) green; forge tests green
- Production deploy via `deploy-grove.sh` (daily timer profile); `production-smoke.sh` passes on `app.buildingcultureid.space`

## Fixed (2026-05-23)

- Unified `AppFooter` in `__root.tsx` (story + product variants); removed duplicate route footers
- TLD mint dashboard on `/pass`; `IdentityMintBand` on `/forest`; `module-themes` + `ModuleShell`
- Culture name resolution: `/api/identity/resolve`, `/api/identity/verify-name`, `/id/$name`, `/n/$name` gateway (see `docs/IDENTITY_RESOLUTION.md`)
- Chainlink RWA compliance matrix + REOC profile D adapters in `apps/places/` (see `docs/CHAINLINK_RWA_COMPLIANCE.md`)
- Identity mint deploy default ~$1.11 USD (`scripts/identity-mint-price-wei.mjs`, `MINT_PRICE_WEI=370000000000000`)
- Join back link points to `/` (not `/welcome`)
- Orphan `app/src/components/welcome/*` removed
- Canonical origin defaults → `app.buildingcultureid.space` in deploy env example, app-origin, production-smoke
- Vite `allowedHosts` includes `.buildingcultureid.space`
- FAQ, investors, community-guide URL map updated for unified app
- Nginx Phase-6 redirect templates in `infra/nginx-unified-entry.example.conf`
- E2E flow specs: landing, onboarding, forest, play, signal, shell
- Server tests: waitlist schema/body size, onboarding-complete schema
- Plain-language labels on `/`, `/join`, `/forest`, `/play` via `plain-labels.ts`
- `@/lib/abi` removed; callers use `@bc/contracts-sdk`
- READMEs: root, `app/`, `docs/`

## Identity mint price (~$1.11 USD in ETH)

- **Production** `mintPrice` set to `370000000000000` wei on `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` (see `docs/IDENTITY_MINT_PRICE.md`)
- Recompute wei: `node scripts/identity-mint-price-wei.mjs` → `./scripts/set-identity-mint-price-onchain.sh` when ETH/USD moves
- UI copy centralized in `app/src/lib/identity/mint-price.ts`; live ETH from on-chain `mintPrice`

## Open

| Item | Notes |
|------|-------|
| Grove X / Farcaster / Slack on VPS | Telegram outbound configured (`GROVE_TELEGRAM_CHAT_ID` + `TELEGRAM_BOT_TOKEN`); add `GROVE_X_*`, `GROVE_NEYNAR_*`, `GROVE_SLACK_WEBHOOK_URL` for multi-channel growth |
| Live nginx 301 on VPS | Templates in repo; operator must apply on production |
| Reliability gate checks | Require strict production smoke + 4h endpoint loop (`/api/pulse/metrics`, `/api/market/bcc`, `/api/market/health`, `/api/trading/health`, `/api/marketing/grove/tick`) |
| Identity contracts-only tree | `apps/identity` frontend removed; mint UI is unified `app/` |
| External ecosystem sites | capital/home/game still separate URLs in landing footer |
| Chain E2E in CI | Optional `CI_WALLET_E2E=1` + Anvil — not default |
| Transitive `@coinbase/wallet-sdk` 3.x | Via wagmi connectors; wait for upstream bump |
| Elias corpus touchpoints SQL | Still references legacy `.capital` hosts in seed data |
| Full app copy pass | Marketplace, profile, elias — out of scope for critical-path pass |
| Repo-wide Prettier drift | Cleanup wave ran `npm run format` in `app/` — re-run verify after large edits |

## Outcome mapping (why each open item matters)

| Open item | Ecosystem outcome impact |
|-----------|--------------------------|
| Live nginx 301 on VPS | Canonical front-door trust and conversion consistency |
| Reliability gate checks | Investor-grade uptime and safe campaign scaling |
| `apps/identity` wagmi v2 | Identity mint reliability and developer velocity |
| External ecosystem sites still split | Ecosystem cross-traffic measurement and narrative cohesion |
| Chain E2E in CI not default | Release confidence for wallet and mint critical path |
| `@coinbase/wallet-sdk` transitive 3.x | Wallet stability and support burden |
| Elias corpus legacy `.capital` hosts | Search/discovery accuracy for canonical domain |
| Full app copy pass pending | Public clarity and conversion quality |
| Repo-wide Prettier drift | CI reliability and operator iteration speed |

## Monthly review owner update

- Growth owner: validates attribution and conversion-impacting items.
- Platform ops owner: validates reliability-impacting items.
- Product owner: validates narrative and UX-impacting items.

Update this file after each monthly ecosystem review with status changes and owner assignments.

## Verify checklist (last run: 2026-06-08, beta → live gate)

| Gate | Result |
|------|--------|
| `npm run audit:env` | phases 0–2 ready |
| packages `npm test` | agent-runtime 20, bcc-kit 5, culture-auth 5, support-score 3 |
| `forge test` | contracts 45, identity 9, art 3, places 47 + chainlink 9 |
| `app npm run test:all` | verify + 31 unit + 78 smoke passed |
| `apps/places/web test:e2e` | 41+ passed (navigation/trade e2e aligned to current UI) |
| `npm run contracts:audit` | 0 failed bytecode checks |
| `STRICT_SMOKE=1 production-smoke` | all passed (trading agent WARN only) |
| `npm run growth:audit` | passed |

Run from `app/`:

```bash
NODE_OPTIONS='--max-old-space-size=8192' npm run build
npm run test:unit
npm run test:smoke
```

Manual: [MANUAL_QA_CHECKLIST.md](../app/MANUAL_QA_CHECKLIST.md)

Production (after deploy):

```bash
./scripts/production-smoke.sh https://app.buildingcultureid.space
```

## Farcaster

- `homeUrl` = `${origin}/` (story landing) — confirmed product choice
- Manifest depends on `PUBLIC_APP_ORIGIN` / `VITE_APP_ORIGIN` at build time
