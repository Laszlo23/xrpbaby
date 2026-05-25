# BCD core launch audit (token + fixed-price sale)

Scope: `BuildingCultureDollar` + `BCDFixedPriceSale` (and their wiring). This is an internal engineering audit to drive a launch plan; it is **not** a third‑party security audit.

## Contracts in scope

- Token: `b3/contracts/src/BuildingCultureDollar.sol`
- Sale router: `b3/contracts/src/BCDFixedPriceSale.sol`
- Deploy/wiring: `b3/contracts/script/DeployBCD.s.sol`
- (Related) Genesis claim router: `b3/contracts/src/BCDGenesisClaim.sol` (only if used at launch)

## High-level security posture

- **Token (`BuildingCultureDollar`)**: minimal surface area, supply capped, and minting is routed through **exactly two** external minter contracts plus an owner mint.
- **Sale (`BCDFixedPriceSale`)**: fixed-price rounds with explicit caps and optional merkle allowlists; payment routed directly to treasury; nonReentrant + pause.

The main “risk” is not exotic solidity vulnerabilities; it’s **operational correctness**: ownership, round configuration, merkle roots, and fee settings.

## Invariants (must always hold)

### Supply invariants

- **Cap invariant**: `totalSupply() <= cap` always.\n
  Enforced by `ERC20Capped` inside `BuildingCultureDollar` and covered by tests in `b3/contracts/test/BCDFixedPriceSale.t.sol` (`testRespectsCap`).
- **Only authorized contracts mint**:
  - `genesisMint()` callable only by `genesisClaimContract`
  - `saleMint()` callable only by `fixedSaleContract`
  - `ownerMint()` callable only by owner (Safe)

### Role/ownership invariants

- Owner of `BuildingCultureDollar` must be **Safe multisig** before any funds / launch.\n
- Owner of `BCDFixedPriceSale` must be **Safe multisig**.\n
- Treasury recipient must be a Safe-controlled address.

### Sale invariants

For any `roundId` that is active:

- **Time window**: buy only within `[start, end]`.
- **Round cap**: `roundSoldBcdWei[roundId] + bcdAmountWei <= rounds[roundId].maxBcdWei`.
- **Private round** (`merkleRoot != 0`):
  - proof verifies leaf `keccak256(abi.encode(roundId, buyer, merkleMaxBcdWei))`
  - per-wallet cumulative buy <= `merkleMaxBcdWei`
- **Public round** (`merkleRoot == 0`):
  - optional per-wallet cap enforced if `perWalletPublicCapWei > 0`

### Fee / payment invariants (your “non-negotiable”)

- Payment to treasury is deterministic:
  - `basePayment = ceil(bcdAmountWei * paymentPerWholeBcd / 1e18)`
  - `feePayment = ceil(basePayment * feeBps / 10_000)`
  - `totalPayment = basePayment + feePayment`
- Treasury receives exactly `totalPayment` (ETH path via `.call{value: totalPayment}`, ERC20 path via `transferFrom`).
- `feeBps` bounded by `<= 2000` (20%).

## Privileged roles map (who can do what)

### `BuildingCultureDollar` (owner = Safe)

- **Set genesis claim contract** (once): `setGenesisClaimContract(claim)`
- **Set sale contract** (once): `setFixedSaleContract(sale)`
- **Owner mint** (until disabled): `ownerMint(to, amount)`
- **Irreversible**: disable owner mint: `disableOwnerMintForever()`

### `BCDFixedPriceSale` (owner = Safe)

- Configure rounds: `configureRound(roundId, Round)`
- Set fee bps: `setFeeBps(bps)`
- Pause/unpause: `pause() / unpause()`
- Rescue functions: `rescueETH()`, `rescueERC20(a)` (note: cannot rescue the configured `paymentToken`)

### `BCDGenesisClaim` (owner = Safe, if used)

- Update merkle root, fee, end time
- Pause/unpause

## Known risk areas / things to explicitly test

### 1) Rounding + fee math surprises

Because both `basePayment` and `feePayment` use **ceiling**, small buys can appear “overcharged” vs naive floating point expectations.\n
This is usually correct for “never undercharge” accounting, but your UI must explain it.

### 2) ETH refund path

ETH buys refund `msg.value - totalPayment` via an external call. The contract is `nonReentrant`, which helps.\n
Still: test with a contract wallet buyer (or a receiver that reverts on refund) to ensure UX expectations are clear.

### 3) Public vs private semantics

Public round uses `merkleRoot == 0`. This is clean but easy to misconfigure.\n
If you accidentally publish a non-zero root, buyers will need proofs; if you publish zero, anyone can buy subject to caps.

### 4) Treasury call failures

ETH route uses `.call` to treasury; if treasury is a contract with restrictive fallback, buys will revert.\n
Use a treasury that can receive ETH (Safe can).

### 5) OwnerMint tail risk

Until `disableOwnerMintForever()` is executed, owner can mint within cap. This is a *trust & governance* risk.\n
Mitigation: Safe ownership + published policy (see `b3/docs/BCD_LAUNCH_AUDIT_AND_LP.md`).

## Current tests coverage (what exists)

`b3/contracts/test/BCDFixedPriceSale.t.sol` covers:\n
- Public ETH buy, dust refund\n
- Private merkle buy + over-allocation revert\n
- Bad proof revert\n
- Pause\n
- Token only-sale minter enforcement\n
- Cannot set sale twice\n
- ERC20 payment path (USDC-like)\n
- Cap exceeded behavior\n

Not covered (recommended to add before mainnet funds):\n
- feeBps math + rounding checks for both ETH and ERC20\n
- failure modes when refund receiver reverts\n
- multi-buy accumulation across rounds and within a round\n

## Launch recommendations (engineering)

1. **Safe-first**: transfer ownership of token + sale + genesis claim to Safe before any public endpoints.\n
2. **Prepublish round parameters**: commit round ids, times, caps, and pricing in a human-readable table (and mirror in UI).\n
3. **Merkle hygiene**: use a reproducible script, publish root + leaf format, and keep a “root registry” file.\n
4. **Fee transparency**: show `feeBps` and compute `totalPayment` in UI exactly as contract does.\n
5. **Disable owner mint** at the earliest point consistent with treasury allocations and LP plan.

