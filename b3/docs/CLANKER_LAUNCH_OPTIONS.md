# Clanker launch options (fit analysis)

This doc answers: “Can we use **Clanker** for token deployment, but still keep **our rules** (especially fee routing), with Safe control + developer share?”

## What Clanker v4 gives you (and what it forces)

From Clanker docs:

- Deployed tokens are **fixed-supply ERC‑20 with total supply = 100B** (18 decimals), non-mintable post-deploy, burnable. ([Token Deployments](https://clanker.gitbook.io/clanker-documentation/users/token-deployment-and-token-info))
- Liquidity is placed into a **Uniswap v4 pool** with a **locker** that routes LP fees to **configured reward recipients** (bps must sum to 10,000; max 7 recipients). ([Deployment Config](https://clanker.gitbook.io/clanker-documentation/references/core-contracts/v4/deployment-config))
- Token deployments can be triggered via a hosted API endpoint requiring an API key (or via onchain `deployToken()` depending on integration approach). ([Deploy Token v4](https://clanker.gitbook.io/clanker-documentation/authenticated/deploy-token-v4.0.0))

**Hard implication**: if your primary token needs a custom cap (e.g. 1M) or your own sale mechanics are canonical, Clanker cannot be a drop-in replacement without accepting Clanker’s supply + pool + auction constraints.

## Your stated non-negotiable

- **Fee control / routing** must match your rules.\n
  In your current system this is enforced by `BCDFixedPriceSale` routing payments directly to `treasury` and by explicit `feeBps` math (`b3/contracts/src/BCDFixedPriceSale.sol`).

## Option A (recommended): Hybrid — keep BCD core, use Clanker as a *market layer token*

### Concept

- Keep your existing, auditable core:
  - `BuildingCultureDollar` cap + mint permissions
  - `BCDFixedPriceSale` for your exact pricing + fee routing rules
- Use Clanker to launch a **separate token** for market/liquidity + distribution experiments.\n
  That token can represent marketing/community value, while BCD remains the in-app accounting unit.

### Pros

- Your “fee control” remains **exactly** what you wrote and tested.\n
- Safer operations: your core tokenomics aren’t forced into Clanker’s 100B supply.
- You still get a “cool” launch with Clanker’s v4 pool/locker and reward routing.

### Cons

- Two-token story requires clear messaging (avoid confusing users about which token does what).

### How Safe + dev share works in Clanker

Use Clanker locker reward recipients:\n
- Reward recipients array includes Safe and dev (and optionally a third recipient).\n
- Reward bps are immutable after deployment; only recipients can be updated by their admin (per docs).\n

Example (illustrative):\n
- Safe: 8,500 bps (85%)\n
- Dev: 1,500 bps (15%)\n

This achieves “dev gets a piece” without impacting your BCD sale fee routing at all.

## Option B: Clanker as primary token (high effort + forced compromises)

### Concept

- Clanker deploys the **actual primary token** (instead of `BuildingCultureDollar`).\n
- Your sale rules would need to be reworked:\n
  - either abandon `BCDFixedPriceSale`, or\n
  - keep it but it cannot mint supply into a Clanker token if Clanker token is non-mintable post-deploy.

### Forced compromises (non-exhaustive)

- Accept **100B fixed supply**.\n
- Accept Clanker v4 launch mechanics (Uni v4 pool/auction timing).\n
- Fee routing becomes “LP fees to reward recipients”, which is **not** identical to your current “sale fee bps to treasury”.\n
  You can configure Safe+dev recipients, but the semantics differ.\n

### When Option B is rational

- You explicitly want Clanker’s standardized token+pool system, and you’re okay rewriting your current BCD sale primitives.\n
- You want a permissionless “deployer UX” and accept the constraints for speed.

## Recommendation

Given your single non-negotiable (“fee control must match our rules”), Option A is the path that preserves correctness:\n
- Keep BCD + `BCDFixedPriceSale` as canonical\n
- Use Clanker as an **additional launch / market token layer** that routes LP fees to Safe + dev

## Next decisions (to make Option A concrete)

1. Pick the Clanker token’s role (community/points/market token) and its relationship to BCD.\n
2. Choose a reward split (bps) between Safe and dev.\n
3. Decide whether you deploy Clanker via:\n
   - Clanker hosted API (needs API key), or\n
   - direct onchain `deployToken()` integration (more work, less centralized dependency).

