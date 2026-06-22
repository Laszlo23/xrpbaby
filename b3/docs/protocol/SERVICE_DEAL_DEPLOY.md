# ServiceDealEscrow deployment (Base 8453)

**Status: deployed 2026-06-21**

| Role | Address |
|------|---------|
| ServiceDealEscrow | [`0xb0a44Fc3f52EB3B575b113Ef7Ef8D778a55B5Dfb`](https://basescan.org/address/0xb0a44Fc3f52EB3B575b113Ef7Ef8D778a55B5Dfb) |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Admin (DEFAULT_ADMIN_ROLE) | Protocol Safe `0x0D106D512Ac28cc29E625b22C6628989013c4C6B` |
| Council (COUNCIL_ROLE) | Same Safe |
| AI oracle (AI_ORACLE_ROLE) | `0x477beD9204a958aED0F8D2B0e0C68d7ba3b4B7d3` |

Broadcast artifact: [`contracts/broadcast/DeployServiceDealEscrow.s.sol/8453/run-latest.json`](../contracts/broadcast/DeployServiceDealEscrow.s.sol/8453/run-latest.json)

Registry: [`contracts/deployments/8453.json`](../contracts/deployments/8453.json)

## App env (server + browser)

Set in `app/.env` / `deploy/.env` (never commit):

- `SERVICE_DEAL_ESCROW_ADDRESS` / `VITE_SERVICE_DEAL_ESCROW_ADDRESS`
- `SERVICE_DEAL_USDC_ADDRESS` / `VITE_SERVICE_DEAL_USDC_ADDRESS`
- `SERVICE_DEAL_AI_ORACLE_PRIVATE_KEY` — dedicated hot wallet; fund with ETH on Base for gas
- `SERVICE_DEAL_COUNCIL_SAFE` — council UI allowlist
- `SERVICE_DEAL_CRON_SECRET` — Bearer for `POST /api/partner-deals/settle-tick`

## Redeploy (only if needed)

```bash
cd b3/contracts
export PRIVATE_KEY=0x...
export SERVICE_DEAL_USDC=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
export SERVICE_DEAL_ADMIN=0x0D106D512Ac28cc29E625b22C6628989013c4C6B
export SERVICE_DEAL_AI_ORACLE=0x...
export SERVICE_DEAL_COUNCIL=0x0D106D512Ac28cc29E625b22C6628989013c4C6B

forge script script/DeployServiceDealEscrow.s.sol \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --skip script/DeployGroveTwinBloom.s.sol
```

## Council overrides

`COUNCIL_ROLE` is held by the **protocol Safe**. Overrides must be executed as a Safe transaction (`msg.sender` = Safe). The app builds calldata; signers execute via Safe UI.

## Settle cron

```bash
curl -X POST https://app.buildingcultureid.space/api/partner-deals/settle-tick \
  -H "Authorization: Bearer $SERVICE_DEAL_CRON_SECRET"
```

Schedule daily (or after veto windows) on your ops runner.

## Role rotation

Safe executes on the escrow contract:

```solidity
escrow.grantRole(AI_ORACLE_ROLE, newOracle);
escrow.revokeRole(AI_ORACLE_ROLE, oldOracle);
```
