# Liquidity rebalancing policy (demo / operations)

Automated or semi-automated **rebalancing** of AMM liquidity (OgRouter / OgPair) affects all LPs and traders. This stack treats **liquidity moves as policy-controlled execution**, not as free-form AI output.

## Principles

1. **No LLM signing** — Large language models must not hold private keys or submit transactions. Any “AI rebalancing” is **analytics and simulation only** unless a separate, deterministic **keeper** signs with an explicit policy.
2. **Human or multisig governance** — Changes to target weights, allowed pairs, max daily volume, and slippage bounds should pass through **multisig**, **timelock**, or documented operator runbooks.
3. **Deterministic keepers** — Production-style rebalancing uses a **bot** (scheduled job or chain listener) that compares pool state to a **declared target** (e.g. band around an oracle or fixed ratio) and executes swaps / adds within **hard caps**.
4. **User alignment** — “Best interest” is expressed as **transparent rules** (fees, bounds, pause switches), not as marketing claims. Disclose conflicts if the protocol or treasury also provides liquidity.

## Suggested parameters (illustrative)

| Parameter | Role |
|-----------|------|
| `max_slippage_bps` | Upper bound on any single rebalance trade |
| `max_notional_per_day` | Caps operator/keeper impact |
| `allowed_pairs` | Only WETH–share pairs that passed compliance `setSystemContract` |
| `pause` | Emergency stop without upgrading contracts |

## AI layer (optional)

- **Signals**: ML or heuristics may **flag** when a pool is skewed or when volume is one-sided; output is inputs to **human/keeper** review.
- **Explanation**: Assistants may describe **why** rebalancing might be considered under your published policy; they must not promise returns or optimal timing.

## References

- Deployment and bootstrap: [`deployments/README.md`](../deployments/README.md), [`script/BootstrapLiquidity.s.sol`](../script/BootstrapLiquidity.s.sol)
- AMM: [`src/defi/OgRouter.sol`](../src/defi/OgRouter.sol)
