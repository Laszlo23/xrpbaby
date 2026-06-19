# Culture Chronicles — operator launch

## Deploy contract (Base)

```bash
export PRIVATE_KEY=...
export TREASURY=0x...
export RPC_URL=https://mainnet.base.org
export CHRONICLES_LAUNCH_HOURS=48
export CHRONICLES_BASE_URI=https://app.buildingcultureid.space/chronicles/metadata/
npm run chronicles:deploy
```

Add the logged `CultureChronicles1155` address to:

- `contracts/deployments/8453.json` → `"CultureChronicles1155": "0x..."`
- `app/src/data/addresses.json` under `networks.8453.culture` (or genesisVault sibling)
- `app/.env` and `deploy/.env`: `VITE_CULTURE_CHRONICLES_ADDRESS=0x...`

Then: `npm run contracts:sdk && npm --prefix packages/contracts-sdk run build`

## Assets

```bash
npm run chronicles:optimize
npm run chronicles:metadata
```

## Frontend

Deploy app as usual. Verify:

- `/chronicles` — chapter map
- `/chronicles/ch-01` — mint panel (live after contract env set)
- `/collections` — supply bars
- Forest dashboard — chronicle CTA + quests

## Launch pricing

Chapters 1–3 mint at **0.00019 ETH** until `launchEndsAt` (48h from deploy by default). Owner can extend via `setLaunchEndsAt` on contract.

## E2E

```bash
cd app && npx playwright test e2e/chronicles.spec.ts
```
