# BCD pre-launch runbook (Safe-owned) + go/no-go

This runbook turns `BCD_TOKENOMICS_LAUNCH.md` and `BCD_LAUNCH_AUDIT_AND_LP.md` into a concrete execution checklist.

## 0) Inputs (decide and freeze)

- **Token cap** (`BCD_CAP`): default `1_000_000 ether` (see `b3/docs/BCD_TOKENOMICS_LAUNCH.md`)\n
- **Treasury**: Safe address (receives sale proceeds)\n
- **Payment asset** per round:\n
  - ETH: `paymentToken = address(0)`\n
  - USDC (Base): `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` and `paymentPerWholeBcd` in **6‑decimals** per 1e18 BCD\n
- **Fee bps** (`feeBps`) for sale router\n
- **Round schedule** (roundId, start, end, maxBcdWei, price)\n
- **Merkle roots** for private rounds (and the published leaf format)\n

## 1) Deploy (testnet first)

Use `b3/contracts/script/DeployBCD.s.sol` with:\n
- `PRIVATE_KEY` (deployer key)\n
- `TREASURY` (Safe)\n
- `BCD_CAP`\n
- `GENESIS_MERKLE_ROOT` (zeros ok for dormant)\n
- Optional: `DEPLOY_BCD_FIXED_SALE=1` + `BCD_SALE_PAYMENT_TOKEN`\n

After deploy:\n
- Wire `genesisClaimContract` and `fixedSaleContract` once (script already does this).\n
- **Transfer ownership of token + routers to Safe** (do not launch with EOA ownership).\n

## 2) Configure sale rounds (Safe transactions)

For each `roundId`:\n
- Call `configureRound(roundId, Round)` on `BCDFixedPriceSale`:\n
  - start/end timestamps\n
  - `merkleRoot != 0` for private, `0` for public\n
  - `paymentPerWholeBcd`\n
  - `maxBcdWei`\n
  - `perWalletPublicCapWei` (public only)\n
\n
Then set fees:\n
- Call `setFeeBps(feeBps)`\n

## 3) Merkle ops (private rounds and/or genesis claim)

### Leaf formats

- **Sale private round** (`BCDFixedPriceSale`):\n
  `leaf = keccak256(abi.encode(roundId, account, maxBcdWei))`\n
  (see `b3/docs/BCD_TOKENOMICS_LAUNCH.md`)\n
- **Genesis claim** (`BCDGenesisClaim`):\n
  `leaf = keccak256(abi.encode(account, amount))`\n

### Operational requirements

- Use a reproducible script; commit it or at least commit the inputs (CSV) + resulting root.\n
- Publish:\n
  - merkle root(s)\n
  - leaf schema\n
  - how users can verify their leaf locally\n

## 4) UI / backend readiness checklist

- UI computes total payment exactly as contract does:\n
  - ceil base payment + ceil fee\n
- UI displays:\n
  - round active window\n
  - per-wallet caps\n
  - fee bps\n
- If using an eligibility API for proofs: ensure it cannot be trivially abused (rate-limit, caching, signatures).

## 5) LP / liquidity plan (post-sale)

From `b3/docs/BCD_LAUNCH_AUDIT_AND_LP.md`:\n
1. Confirm rounds ended or paused.\n
2. Safe mints liquidity allocation via `ownerMint`.\n
3. Add Base DEX liquidity from Safe.\n
4. Optionally lock LP / custody.\n
5. Publish pool links.\n

## 6) Go / No-Go checklist (launch gate)

### Go if ALL true

- **Ownership**:\n
  - Token owner = Safe\n
  - Sale owner = Safe\n
  - Genesis claim owner = Safe (if used)\n
- **Treasury**:\n
  - Treasury address is correct and can receive ETH + ERC20\n
- **Rounds**:\n
  - All round params reviewed by 2 humans\n
  - Private rounds have correct merkle root\n
  - Public rounds have `merkleRoot == 0` (intended)\n
  - Caps and schedules match published plan\n
- **Fee correctness**:\n
  - feeBps matches the published number\n
  - UI total matches onchain simulation for at least 5 cases (small, medium, large)\n
- **Kill switch**:\n
  - `pause()` works and is reachable by Safe\n
- **Cap headroom**:\n
  - You have an explicit cap spreadsheet that sums worst-case genesis + sale + ownerMint <= cap\n

### No-Go if ANY true

- Any contract still owned by an EOA\n
- Merkle roots not reproducible / not published\n
- UI does not match rounding semantics\n
- Treasury cannot receive ETH (breaks buys)\n

## 7) When to call `disableOwnerMintForever()`

Call it only after:\n
- all discretionary allocations (LP seed, vesting, incentive programs) are minted, AND\n
- you’re comfortable removing the last “admin mint” lever.\n
\n
This is your strongest credibility move for “no surprise minting” risk, but it must not block legitimate allocations.

## 8) Agent monetization (ERC-8004 / autonomous callers)

SKU order, **x402** env (`THIRDWEB_SECRET_KEY`, `X402_SERVER_WALLET_ADDRESS`, optional `X402_PAY_TO` / `X402_PUBLIC_ORIGIN` / `PUBLIC_APP_ORIGIN` / `X402_CORS_ORIGINS`), `/.well-known/agent.json`, and marketing attribution (`agent_ref`, UTMs → PostHog `landing_view` and conversion events): see **`b3/docs/BCD_AGENT_MONETIZATION.md`**.

