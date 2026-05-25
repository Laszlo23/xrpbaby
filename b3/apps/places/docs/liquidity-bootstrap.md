# Liquidity bootstrap (Base mainnet)

Guidance for seeding pools so secondary trading and price discovery remain **auditable**.

## Pair strategy

1. **Settlement / stable**: `PLATFORM_TOKEN / USDC` (or USDbC on Base) — primary liquidity for users swapping into the checkout asset.
2. **Settlement / WETH**: Optional for ETH-native wallets.
3. **Property share / settlement or share / stable**: Use [`OgRouter`](../deployments/base-mainnet.json) pools per property once share tokens exist; align with [`BootstrapLiquidity.s.sol`](../script/BootstrapLiquidity.s.sol) patterns.

## Minimal seed for the in-app Trade page (`WETH / share`)

The web app’s secondary path calls `OgRouter.swapExactETHForTokens`, which needs a **non-empty** Uniswap-style pair between **WETH** (your deployed `WETH9`) and the **property share token**. Until that pair exists, the UI will show “no liquidity pool.”

- **Someone must add liquidity once** — usually the issuer or protocol treasury — depositing both sides (wrapped native + shares). This is **not** created automatically by the first swapper; see [`deployments/README.md`](../deployments/README.md) bootstrap section for `BootstrapLiquidity` env vars.

- The amount can be **small** to enable first quotes; deepen later under your LP policy.

- **USDC primary** (`PrimaryShareSaleERC20`) can go live **without** this pool; the pool is only required for **secondary** ETH-in swaps in the built-in AMM.

## Incentives budget

- Allocate a **fixed** LP incentive budget from treasury multisig (never undisclosed mints).
- Prefer **time-limited** incentive programs with published APY assumptions and impermanent loss disclaimers.

## Monitoring

- Track TVL, spread, and major LP additions on Basescan / DEX analytics.
- Alert on abnormal price moves or liquidity pulls.

## Fair launch checklist

- Publish pool addresses before large incentives go live.
- Avoid insider-only LP at distorted prices; document any seed liquidity terms.
