# Audit scope — smart contracts

## In scope (Base mainnet + test suites)

### Root `contracts/`

- `BuildingCultureDollar` (BCC ERC-20)
- `BccBridge` (Base ↔ BSC)
- `BCDGenesisClaim`, `BCDFixedPriceSale`
- `RaffleTicketCampaign`, `AgentShareCampaign`
- `BccRootsStaking`, `DailyCheckIn`, `CulturePulseAnchor`
- `GenesisVaultPass`, `AgentId`

### `apps/identity/contracts/`

- `CultureLayerIdentity` / V2

### `apps/places/`

- RWA registry, compliance, lending hooks (see `apps/places/test/`)

### `apps/art/contracts/`

- `BuildingCultureHub` / V2

## Out of scope

- Third-party dependencies (OpenZeppelin — use published audits)
- Off-chain app API (`app/src/routes/api/*`) — separate app security review
- Agent LLM inference paths
- Strapi CMS

## Networks

- Primary: Base (8453)
- Secondary: BSC wrapped BCC, 0G AgentId (documented separately)
