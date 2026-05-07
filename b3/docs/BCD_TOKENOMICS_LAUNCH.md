# BCD on-chain launch — tokenomics defaults (Phase 0)

Internal reference until counsel and treasury finalize numbers. **`BuildingCultureDollar` uses 18 decimals.**

## Supply

| Parameter | Default / note |
|-----------|----------------|
| **Cap** | `1_000_000 ether` (1M BCD) — matches `DeployBCD.s.sol` / `BCD_CAP` env |
| **Genesis / merkle grants** | Budget leaves in `BCDGenesisClaim` merkle; does not change cap |
| **Sale rounds** | `BCDFixedPriceSale` mints via `saleMint` within same cap |
| **Treasury / vesting / LP** | `ownerMint` from multisig until `disableOwnerMintForever()` |

**Invariant:** `totalSupply() <= cap` across genesis + all sale purchases + all `ownerMint`.

## Round split (illustrative — replace with counsel-approved allocations)

Reserve **headroom**: cap minus (max sale allocations + genesis max mint + vesting spreadsheet).

Suggested buckets:

- **Private round 1** — merkle whitelist, fixed price (ETH or USDC), hard cap per round + max per wallet encoded in leaf.
- **Public round** — `merkleRoot == 0` in contract; gated only by wallet cap + round hard cap + time window.
- **Genesis / missions** — existing `BCDGenesisClaim` for zero/low-fee claims if still used alongside sale.

Avoid double-selling the same economic rights: disjoint merkles or explicit policy per address.

## Payment asset

- **Native ETH:** `paymentToken = address(0)` on `BCDFixedPriceSale`.
- **USDC (Base mainnet):** set `paymentToken` to `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` and use `paymentPerWholeBcd` in **6-decimal** USDC units per 1e18 BCD wei (see contract NatSpec).

## Merkle leaf (private rounds)

Used by `BCDFixedPriceSale` for `merkleRoot != 0`:

```text
leaf = keccak256(abi.encode(roundId, account, maxBcdWei))
```

- **`roundId`** — must match the round being purchased.
- **`account`** — buyer address (claimant).
- **`maxBcdWei`** — max cumulative BCD (18-decimal wei) purchasable in that round by this wallet.

## Ops checklist (pre-mainnet)

- [ ] Replace illustrative allocation table with counsel-approved spreadsheet.
- [ ] Generate roots with audited script / standard OZ tooling; publish root + verifier.
- [ ] Multisig owns `BuildingCultureDollar`, `BCDGenesisClaim`, `BCDFixedPriceSale`.
- [ ] Run external audit scoped to **`BuildingCultureDollar` + `BCDFixedPriceSale`** changes plus deploy scripts.
