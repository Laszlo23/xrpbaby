# Culture Layer name resolution (no ICANN budget)

Culture names like `laszlo.culture` are an **onchain namespace** on Base (`CultureLayerIdentity`), not a purchased ICANN TLD. This doc describes the **free** resolution layer in the unified app.

## What works today (zero extra spend)

| Feature | URL / API |
|---------|-----------|
| Resolve name → owner | `GET /api/identity/resolve?name=laszlo.culture` |
| Prove wallet owns name | `POST /api/identity/verify-name` (SIWE) |
| Public profile | `/id/laszlo.culture` |
| Short share link | `/n/laszlo.culture` → redirects to `/id/…` |

Contract: `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` on Base (`8453`).  
Env: `VITE_IDENTITY_CONTRACT_ADDRESS`, `VITE_IDENTITY_CHAIN_ID`.

## What this is not

- Not `https://laszlo.culture` in every browser (needs ICANN `.culture` or DNS you operate).
- Not automatic ENS/Basename registration (users can link those wallets separately; we only read Basenames for display today).

## How to share a name

After mint, share:

- `https://app.buildingcultureid.space/n/laszlo.culture` (short), or
- `https://app.buildingcultureid.space/id/laszlo.culture` (canonical)

Both resolve the same profile with onchain owner data.

## Optional later (still low cost)

- CCIP resolver contract (gas only) for wallet ecosystems
- DNS wildcard on a domain you already own, e.g. `*.culture.app.buildingcultureid.space` → app (nginx on existing host)

## Code map

- `app/src/server/identity/resolve.ts` — onchain read + status
- `app/src/lib/identity/urls.ts` — profile/gateway paths
- `app/src/components/identity/CultureNameProfile.tsx` — profile UI

Mint price ops: [IDENTITY_MINT_PRICE.md](./IDENTITY_MINT_PRICE.md)
