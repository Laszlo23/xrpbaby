# Building Culture — monorepo (`b3`)

One app, one story: community, drops, onchain identity, and real-estate tokenization — with clear separation between **Play drops**, **NFT marketplace**, and **Places (REOC) securities**.

## Production URLs

| URL | What you get |
|-----|----------------|
| [app.buildingcultureid.space/](https://app.buildingcultureid.space/) | Story landing |
| `/play` | RWA experience drops & raffle tickets (not property shares) |
| `/join` | Wallet sign-in / pass |
| `/forest` | Community hub — stats, quests, modules |
| `/pass` | Mint Culture Layer `.culture` names on Base (~$1.11 ETH) |
| `/places` | Hub → [buildingculture.capital](https://buildingculture.capital) invest/trade |
| `/marketplace` | ERC-721 secondary market (thirdweb) — **not** fractional real estate |
| `/investors` | Capital overview + Chainlink RWA compliance status |
| `/id/{name}.culture` | Culture name profile (onchain resolve) |

Legacy hosts redirect during cutover — [docs/DOMAIN_CUTOVER.md](docs/DOMAIN_CUTOVER.md).

## Repository map

| Path | Role |
|------|------|
| [`app/`](app/) | **Unified TanStack app** — landing, forest, pass, marketplace, compliance API |
| [`apps/places/`](apps/places/) | **Real estate on Base** — REOC contracts, DTA/PoR, Next.js at buildingculture.capital |
| [`apps/identity/`](apps/identity/) | Culture Layer identity mini-app (merging into `app/`) |
| [`contracts/`](contracts/) | BCD, raffles (`RaffleTicketCampaignVrf` for Chainlink VRF) |
| [`cms/`](cms/) | Strapi CMS |
| [`packages/`](packages/) | Shared `@bc/*` SDKs |
| [`docs/`](docs/) | Runbooks — [docs/README.md](docs/README.md) |

## Quick start (local)

```bash
npm install
npm run db:start               # Postgres :55432
npm run dev:platform           # → http://localhost:5173
```

Optional:

```bash
cd apps/places && forge test --match-path 'test/chainlink/*'   # REOC + Chainlink adapters
cd contracts && forge test                                      # culture contracts
npm --prefix cms run develop                                    # Strapi :1337
```

## Tests (run before push)

```bash
# Unified app — unit + e2e (production SSR)
cd app
npm run test:unit
NODE_OPTIONS='--max-old-space-size=8192' npx playwright test e2e/compliance-places.spec.ts e2e/identity-resolve.spec.ts e2e/pass.spec.ts e2e/shell.spec.ts

# Places REOC / Chainlink stack
cd ../apps/places
forge test
```

Full gate: `cd app && npm run test:all` (lint, typecheck, build, unit, all e2e).

## Key docs

| Doc | Topic |
|-----|--------|
| [CHAINLINK_RWA_COMPLIANCE.md](docs/CHAINLINK_RWA_COMPLIANCE.md) | RWA gap matrix — ACE, DTA, PoR, uRWA |
| [IDENTITY_RESOLUTION.md](docs/IDENTITY_RESOLUTION.md) | Culture names `/id`, `/n`, API |
| [IDENTITY_MINT_PRICE.md](docs/IDENTITY_MINT_PRICE.md) | ~$1.11 mint on Base |
| [ADDRESSES.md](docs/ADDRESSES.md) | Contract addresses (Base, Places, identity) |
| [SMART_WALLET_AND_PACKS.md](docs/SMART_WALLET_AND_PACKS.md) | Privy wallet, Stripe packs, Culture Points |
| [MISSING_AND_FIXES.md](docs/MISSING_AND_FIXES.md) | Living tracker |
| [apps/places/README.md](apps/places/README.md) | Property tokenization stack |

## Product boundaries (read this once)

- **Play `/play`** — experience/raffle drops; use **VRF** raffles for “provably fair” claims.
- **`/marketplace`** — NFT listings only.
- **`apps/places`** — fractional **property share** tokens (REOC), compliance-gated; production at buildingculture.capital.
- **Culture Pulse anchor** — social digest, not asset Proof of Reserve.

## Chainlink alignment (summary)

Places targets **REOC profile D**: uRWA transfer checks, DTA subscribe/redeem, NAV oracle adapter, PoR mint caps. Partner onboarding: [CHAINLINK_PARTNER_ONBOARDING.md](docs/CHAINLINK_PARTNER_ONBOARDING.md).

Do **not** claim full Chainlink ACE/DTA certification until partner sandbox + audit evidence is published.
