#!/usr/bin/env node
/**
 * Operator checklist: Balancer gauge + LP incentives for BCC/WETH on Base.
 * Usage: npm run balancer:gauge-checklist
 */
console.log(`
# Balancer gauge + incentives checklist — Building Culture DAO

## Prerequisites
- [ ] Safe-owned BCC/WETH pool live on Base (npm run balancer:pool-checklist)
- [ ] Pool + BPT addresses in env and bcc-8453.json

## 1. Register gauge
- [ ] Balancer UI → pool → stake / gauge tab on Base
- [ ] Or ChildChainLiquidityGaugeFactory on Base (see Balancer gauges docs)
- [ ] Record VITE_BCC_BALANCER_GAUGE in deploy/.env + app/.env
- [ ] npm run balancer:verify -- --pool 0x... --bpt 0x... --gauge 0x...

## 2. Incentive epoch (pick one or combine)

### Option A — Treasury BCC bribes (recommended v1)
- [ ] Counsel-approved weekly BCC budget
- [ ] Fund gauge incentive / bribe for this epoch
- [ ] Publish amount + tx hash on canonical comms
- [ ] LPs: stake BPT in gauge → claim via Balancer rewards UI

### Option B — veBAL vote campaign
- [ ] Community outreach for veBAL gauge votes
- [ ] Track weekly BAL emission share (upside only)

### Option C — veBPT (Phase 2)
- [ ] See docs/BCC_DAO_GOVERNANCE.md — Vote Escrow Launchpad on BPT

## 3. Verify LP rewards path
- [ ] Test wallet: add small LP → stake BPT → claim rewards (if epoch funded)
- [ ] Culture Power: POST /api/member/culture-power/refresh after LP

## 4. Transparency
- [ ] Treasury ops log entry for incentive funding
- [ ] Update docs/BCC_BALANCER_LIQUIDITY.md with epoch table when live

Docs: docs/BCC_BALANCER_DAO_STRATEGY.md
`);
