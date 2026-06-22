# Contract audit (Base mainnet)

Last run: **2026-06-04** via `npm run contracts:audit` (bytecode checks on chain ID `8453`).

Canonical human index: [ADDRESSES.md](./ADDRESSES.md). Machine JSON: [ADDRESSES.json](./ADDRESSES.json).

---

## Summary

| Status | Count | Meaning |
|--------|-------|---------|
| **Live** | 18 | Bytecode present on Base; wired in `app/.env` or Places deploy JSON |
| **Env missing** | 3 | In repo but not deployed / not set: DailyCheckIn, BCDFixedPriceSale, PrimaryShareSaleBcc |
| **Manifest drift** | 1 | `contracts/deployments/8453.json` still lists **legacy BCD** token, not canonical **BCC** |

---

## Two platform tokens (do not confuse)

| Symbol | Address | Role in app |
|--------|---------|-------------|
| **BCC** Building Culture Coin | `0xb890a5289f789f1346032ccc1847939e855fab07` | **Canonical** — `VITE_BCC_TOKEN_ADDRESS`, Buy BCC, trading agent, identity v2 / hub v2 pay-with-BCC |
| **BCD** Building Culture Dollar | `0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72` | **Legacy** capped token from first `DeployAll`; still used by `BCDGenesisClaim` on-chain |

`BCDGenesisClaim` (`0x2bae6b04…`) is wired to **BCD only**. Merkle genesis claims mint BCD even when the UI labels balances as BCC. Use `VITE_BCD_LEGACY_TOKEN_ADDRESS` for genesis balance display (see `app/.env.example`).

---

## Unified app (`app/.env`) — Base `8453`

| Env / contract | Address | On-chain | Notes |
|----------------|---------|----------|-------|
| `VITE_BCC_TOKEN_ADDRESS` | `0xb890…` | OK | Fair-launch ERC-20 |
| `VITE_BCD_GENESIS_CLAIM_ADDRESS` | `0x2bae…` | OK | Mints **BCD**, not BCC |
| `VITE_IDENTITY_CONTRACT_ADDRESS` | `0x3634…` | OK | `.culture` v1 |
| `VITE_IDENTITY_V2_CONTRACT_ADDRESS` | `0x9942…` | OK | `mintWithBcc` |
| `VITE_ART_HUB_V2` / `VITE_HUB_V2` | `0x97FD…` | OK | Same hub v2 contract |
| `VITE_BCC_ORACLE_ADDRESS` | `0x46C9…` | OK | Mock BCC/USD oracle |
| Ticket v2 (bcc-8453.json) | `0x4F92…` | OK | Not in app env yet |
| `VITE_HUB_ADDRESS` (v1) | `0x6986…` | OK | Legacy art hub |
| `VITE_MARKETPLACE_CONTRACT_ADDRESS` | `0x3af9…` | OK* | thirdweb proxy (~44 B); listings API healthy |
| `COMPLIANCE_REGISTRY_ADDRESS` | `0xa655…` | OK | Matches Places |
| `PULSE_ANCHOR_ADDRESS` | `0x503f…` | OK | Culture digest anchor |
| Raffle / Agent share | `0xb1a8…` / `0x130e…` | OK | Campaign contracts |
| `VITE_DAILY_CHECKIN_ADDRESS` | — | **Not set** | Deploy + set server `DAILY_CHECKIN_CONTRACT_ADDRESS` |
| `VITE_BCD_SALE_ADDRESS` | — | **Not set** | `BCDFixedPriceSale` not on mainnet |
| `VITE_PLACES_BCC_SALE_ADDRESS` | — | **Not set** | Places BCC primary sale |

---

## Places (`apps/places/deployments/base-mainnet.json`)

All entries match `app` compliance + [ADDRESSES.md](./ADDRESSES.md). Treasury Safe: `0x0D106D512Ac28cc29E625b22C6628989013c4C6B`.

`apps/places/web/.env.local` also carries **0G Galileo testnet** addresses (`NEXT_PUBLIC_REGISTRY=0xc774…`) for legacy QA; production Base vars under `NEXT_PUBLIC_BASE_*` are correct.

---

## Identity app (`apps/identity/.env`)

Aligned with unified app for BCC, identity v1/v2, oracle, marketplace.

**BNB (`56`):** `apps/identity/contracts/deployments/56.json` — CultureLayerIdentity **not deployed** (empty address).

---

## 0G Chain (`16661`)

| Contract | Address |
|----------|---------|
| AgentId ERC-721 | `0x0451b1d37058ad57df22d7185aabc6b0a36fc41e` |

Separate chain; not used by Base compliance or BCC flows.

---

## Deployment file hygiene

| File | Issue | Action |
|------|-------|--------|
| `contracts/deployments/8453.json` | `BuildingCultureDollar` = legacy BCD | Use `bcc-8453.json` for BCC; 8453 documents culture bundle + legacy token |
| `docs/ADDRESSES.json` | BCC v2 fields empty | Filled from `bcc-8453.json` |
| `scripts/verify-bcd-base-onchain.sh` | Was checking only legacy BCD | Now checks both BCD and BCC |

Do **not** run `npm run contracts:sdk` blindly after editing `8453.json` — generated `addresses.ts` is curated to map `BuildingCultureDollar` → BCC for app resolution.

---

## Re-run audit

```bash
cd b3
npm run contracts:audit
# optional: npm run contracts:audit -- --rpc https://mainnet.base.org
```

With Foundry:

```bash
./scripts/verify-bcd-base-onchain.sh
```
