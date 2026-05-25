# Missing items and fixes

Living tracker for the unified TanStack app. Update when closing or discovering gaps.

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
| Live nginx 301 on VPS | Templates in repo; operator must apply on production |
| `apps/identity` wagmi v2 | Rest of monorepo on wagmi v3 — upgrade tracked separately |
| External ecosystem sites | capital/home/game still separate URLs in landing footer |
| Chain E2E in CI | Optional `CI_WALLET_E2E=1` + Anvil — not default |
| Transitive `@coinbase/wallet-sdk` 3.x | Via wagmi connectors; wait for upstream bump |
| Elias corpus touchpoints SQL | Still references legacy `.capital` hosts in seed data |
| Full app copy pass | Marketplace, profile, elias — out of scope for critical-path pass |
| Repo-wide Prettier drift | May block `npm run verify` until `eslint --fix` on full tree |

## Verify checklist (last run: 2026-05-23, unified footer + pass)

| Gate | Result |
|------|--------|
| `npm run test:unit` | 31 passed |
| `npm run test:smoke` | shell + pass e2e pass; full smoke needs `NODE_OPTIONS='--max-old-space-size=8192'` for webServer build |
| `npm run build` | pass (with `NODE_OPTIONS='--max-old-space-size=8192'`) |
| `forge test` (identity) | 7 passed |
| `npm run verify` | may fail on repo-wide Prettier drift outside touched files |

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
