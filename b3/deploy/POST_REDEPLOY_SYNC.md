# Post–contract redeploy sync

Run this after the operator deploys a new set of contracts (e.g. raffle v2, Pausable AGS) and updates on-chain addresses.

1. Edit `b3/contracts/deployments/8453.json` with the new addresses (or merge the PR that does so).

2. From **`b3/`** regenerate the TypeScript SDK consumed by the app and agents:

   ```bash
   npm run contracts:sdk
   ```

3. Update **`deploy/.env`** (and this file’s sibling **`.env.example`** for documentation) so every `VITE_*` contract address matches `8453.json`.

4. Rebuild and redeploy images that embed env at build time:

   ```bash
   cp deploy/.env frontend/.env   # if not already symlinked / managed
   ./frontend/scripts/docker-build.sh
   docker compose -f deploy/docker-compose.yml build strapi agent-runtime indexer
   docker compose -f deploy/docker-compose.yml up -d
   ```

5. Run the checklist in **`deploy/VERIFY_GATE.md`** before setting `ECON_LIVE=1`.
