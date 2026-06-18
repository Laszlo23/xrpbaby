# BCID Tokenomics

BCC economy model for BCID mint, credentials, validators, burn, and agent economy.

Extends [BCC_TOKEN.md](../BCC_TOKEN.md). BCID-specific fee flows only.

---

## Fee model

| Action | Price | Payment options |
|--------|-------|-----------------|
| Human BCID mint | ~$1.11 USD equiv | ETH or BCC (-11.11% discount) |
| Onchain credential issue | 0.1 BCC + gas | BCC |
| Agent BCID mint | 1 BCC | BCC |
| Recovery initiate | 0.01 ETH | ETH (burned) |
| Bridge `.culture` → BCID | Free | — |

Oracle: reuse `BccTwapOracle` / `IBccUsdOracle` from live stack.

---

## Revenue split (BCID mint)

| Destination | % | Purpose |
|-------------|---|---------|
| Treasury (Safe) | 70% | Ecosystem ops, grants |
| Burn | 20% | BCC deflation |
| Validator pool | 10% | Credential issuers + bridge validators |

Implementation: extend `BccFeeRouter` with `BCID_MINT` route (Month 3 mainnet).

---

## Treasury model

| Pool | Source | Use |
|------|--------|-----|
| BCID mint fees | 70% of mint revenue | GTM, infra, grants |
| Bridge incentive | 50 BCC × 500 bridges | Migration from `.culture` |
| Agent economy fund | Agent BCID mint fees | Agent marketplace subsidies |
| Validator rewards | 10% mint + cred fees | Issuer compensation |

Treasury Safe: `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c` (Base)

---

## Validator model

**Validators** = approved credential issuers + bridge attesters

| Role | Responsibility | Reward |
|------|----------------|--------|
| BC issuer | Issue high-trust credentials | 0.05 BCC per issue |
| Bridge validator | Confirm `.culture` ownership for bridge | 0.01 BCC per bridge |
| Agent reviewer | Approve Agent BCID registration | 0.1 BCC per approval |

Enrollment: BC admin grants `ISSUER_ROLE` onchain.

---

## Burn model

| Trigger | Amount |
|---------|--------|
| BCID mint (20% split) | 20% of mint fee in BCC equiv |
| Recovery fee | 100% of 0.01 ETH → market buy BCC burn (optional) |
| Failed sybil appeals | Slashed validator stake (future) |

Target: transparent burn events logged in `BccSettlement` table.

---

## Agent economy model

| Flow | BCC movement |
|------|--------------|
| Agent BCID mint | 1 BCC → agent economy fund |
| Agent task payment (x402) | User → agent wallet (existing) |
| Platform fee | 5% of agent revenue → treasury |
| Agent reputation milestone | Bonus from agent fund (10 BCC top agents/month) |

Aligns with [BCD_AGENT_MONETIZATION.md](../BCD_AGENT_MONETIZATION.md) and [AGENT_ECONOMY.md](./AGENT_ECONOMY.md).

---

## Open question (WS3)

**Bridge incentive amount:** 50 BCC proposed for first 500 bridges. Pending treasury capacity review.

---

## Projections (100 BCIDs Month 3)

| Metric | Estimate |
|--------|----------|
| Mint revenue | ~$111 USD equiv |
| Treasury (70%) | ~$78 |
| Burn (20%) | ~$22 BCC equiv |
| Validator pool (10%) | ~$11 |

Scale assumptions documented for investor updates.
