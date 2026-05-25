# Next steps — unified platform (operator)

## 1. Database

```bash
cd app
export DATABASE_URL=postgresql://...
npx prisma migrate deploy
```

## 2. Local dev

```bash
npm install
npm run dev              # TanStack app (default Vite port)
npm run dev:onboarding   # CRA landing (port 3000) — until nginx serves both
```

Set in `onboarding/frontend/.env`:

```
REACT_APP_PLATFORM_ORIGIN=http://localhost:5173
```

## 3. BCD Base Sepolia

```bash
export BASE_SEPOLIA_RPC_URL=...
export PRIVATE_KEY=0x...
./scripts/deploy-bcd-base-sepolia.sh
# Update contracts/deployments/84532.json from broadcast
npm run contracts:sdk
```

In `app/.env` for staging:

```
VITE_BCD_CHAIN_ID=84532
VITE_EVM_NETWORK=base-sepolia
```

## 4. Production unified host

1. Build landing: `cd onboarding/frontend && npm run build`
2. Build app: `./app/scripts/docker-build.sh`
3. Apply [`infra/nginx-unified-entry.example.conf`](../infra/nginx-unified-entry.example.conf)
4. Run migration on production Postgres

## 5. Mongo import (one-time)

```bash
MONGO_LANDING_URL=... MONGO_FOUNDING_URL=... DATABASE_URL=... \
  node scripts/migrate-mongo-to-postgres.mjs
```

Dry run: `DRY_RUN=1` with same env vars.

## 6. Legacy redirects

See [DOMAIN_CUTOVER.md](./DOMAIN_CUTOVER.md).
