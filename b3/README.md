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
| `/places` | Hub → [places.buildingcultureid.space](https://places.buildingcultureid.space) invest/trade |
| `/marketplace` | ERC-721 secondary market (thirdweb) — **not** fractional real estate |
| `/investors` | Capital overview + Chainlink RWA compliance status |
| `/id/{name}.culture` | Culture name profile (onchain resolve) |
| `/0g/agentid` | **BUILDCHAIN Agent ID** — 0G hackathon on-chain proof ([judge README](docs/0G_HACKATHON_JUDGE_README.md)) |

Legacy hosts redirect during cutover — [docs/DOMAIN_CUTOVER.md](docs/DOMAIN_CUTOVER.md).

### 0G APAC Hackathon (judges)

| Resource | Link |
|----------|------|
| Live proof | [app.buildingcultureid.space/0g/agentid](https://app.buildingcultureid.space/0g/agentid) |
| Judge README | [docs/0G_HACKATHON_JUDGE_README.md](docs/0G_HACKATHON_JUDGE_README.md) |
| Submission pack | [docs/0G_HACKATHON_SUBMISSION.md](docs/0G_HACKATHON_SUBMISSION.md) |
| Contract (0G `16661`) | `0x0451b1d37058ad57df22d7185aabc6b0a36fc41e` |

```bash
cd app && npm install && npm run dev   # → /0g/agentid
cd contracts && forge test --match-contract AgentId
```

## Repository map

| Path | Role |
|------|------|
| [`app/`](app/) | **Unified TanStack app** — landing, forest, pass, marketplace, compliance API |
| [`apps/places/`](apps/places/) | **Real estate on Base** — REOC contracts, DTA/PoR, Next.js at places.buildingcultureid.space |
| [`apps/identity/contracts/`](apps/identity/contracts/) | Culture Layer identity deploy contracts (UI in `app/` at `/pass`, `/id/*`) |
| [`apps/art/contracts/`](apps/art/contracts/) | Art drop hub contracts (UI in `app/` at `/drops/art`) |
| [`contracts/`](contracts/) | BCC, raffles (`RaffleTicketCampaignVrf` for Chainlink VRF) |
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
- **`apps/places`** — fractional **property share** tokens (REOC), compliance-gated; production at places.buildingcultureid.space.
- **Culture Pulse anchor** — social digest, not asset Proof of Reserve.

## Chainlink alignment (summary)

Places targets **REOC profile D**: uRWA transfer checks, DTA subscribe/redeem, NAV oracle adapter, PoR mint caps. Partner onboarding: [CHAINLINK_PARTNER_ONBOARDING.md](docs/CHAINLINK_PARTNER_ONBOARDING.md).

Do **not** claim full Chainlink ACE/DTA certification until partner sandbox + audit evidence is published.
