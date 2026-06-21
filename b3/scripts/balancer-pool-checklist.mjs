#!/usr/bin/env node
/**
 * Operator checklist: Safe-owned Balancer BCC/WETH pool on Base.
 * Usage: npm run balancer:pool-checklist
 */
const SAFE = "0xCe03F6E734cC48393Ce41b257E998c68b521EB5c";
const BCC = "0xb890a5289f789f1346032ccc1847939e855fab07";
const WETH = "0x4200000000000000000000000000000000000006";

console.log(`
# Balancer pool checklist — Building Culture DAO
# Safe (owner): ${SAFE}
# BCC: ${BCC}
# WETH: ${WETH}

## 1. Counsel + treasury
- [ ] Emission / seed budget approved (not Roots reward wallet)
- [ ] Public copy reviewed — no "governance token" promises

## 2. Create pool (Balancer V3 weighted 80/20 recommended)
- [ ] Open https://app.balancer.fi/#/base/pools/create
- [ ] Tokens: BCC + WETH
- [ ] Owner / fee manager: protocol Safe
- [ ] Swap fee: 0.3–1% (document choice)
- [ ] Safe signs pool creation tx

## 3. Seed liquidity
- [ ] Safe joinPool with approved BCC + WETH amounts
- [ ] Record pool address, BPT (LP token), pool ID from Balancer UI
- [ ] Log txs in treasury ops log

## 4. Record addresses
- [ ] contracts/deployments/bcc-8453.json → balancer.pool, bpt, gauge
- [ ] deploy/.env + app/.env:
      VITE_BCC_BALANCER_ENABLED=1
      VITE_BCC_BALANCER_POOL=0x...
      VITE_BCC_BALANCER_BPT=0x...
      VITE_BCC_BALANCER_GAUGE=0x...   # after step 5

## 5. Register gauge (see npm run balancer:gauge-checklist)
- [ ] Follow Balancer Base gauge registration for the pool
- [ ] npm run balancer:verify -- --pool 0x... --bpt 0x... --gauge 0x...

## 6. App sync
- [ ] npm run balancer:resolve -- --write
- [ ] npm run sync:vite-env
- [ ] Redeploy production image
- [ ] curl /api/market/bcc → balancer.poolConfigured true

Docs: docs/BCC_BALANCER_LIQUIDITY.md
`);
