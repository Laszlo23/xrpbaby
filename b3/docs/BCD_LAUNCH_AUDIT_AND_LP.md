# BCD launch — audit scope, liquidity, and owner mint policy

Concise operations companion to [`BCD_TOKENOMICS_LAUNCH.md`](BCD_TOKENOMICS_LAUNCH.md) and the on-chain sale plan.

## Professional audit (pre–mainnet funds)

**In scope (minimum):**

- `BuildingCultureDollar` — cap, `genesisMint` / `saleMint` / `ownerMint`, `setFixedSaleContract` one-time wiring, `disableOwnerMintForever` if used.
- `BCDFixedPriceSale` — `configureRound`, `buy` (ETH and ERC-20 paths), merkle verification, caps, fee bps, pause, refunds, reentrancy, treasury pulls.
- `BCDGenesisClaim` if still in production path — merkle, fees, pause.

**Out of scope unless explicitly added:** frontends, backend eligibility hosting, legal/compliance, bridge custody.

Deliverables to request: differential report vs current tag, invariant list, privileged-role checklist (owner / Safe multisig).

## Liquidity / LP runbook

1. Confirm **sale rounds** (`BCDFixedPriceSale`) completed or paused; treasury has received proceeds.
2. Multisig **`ownerMint`** (or treasury policy via vesting schedules) allocates BCD reserved for liquidity per tokenomics doc.
3. Add DEX liquidity on Base (pair with chosen quote asset — e.g. WETH/USDC): use Safe transactions; snapshot pool address and LP token id if applicable.
4. Optional: LP lock / transfer LP position to custody; document timelines and disclosures per product/counsel.
5. Publish pool links (Basescan + Dune/DefiLlama if desired).

## `disableOwnerMintForever`

- Callable on `BuildingCultureDollar` once **all discretionary `ownerMint` distributions** needed post-TGE are done (liquidity seed, milestones in tokenomics).
- After calling, **no further `ownerMint`** — reduces insider mint tail risk; genesis and sale minters remain governed by their own contracts.
- Coordinate timing with vesting / legal; avoid locking before treasury has minted contractual allocations.
