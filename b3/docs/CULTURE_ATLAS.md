# Culture Atlas

Community-owned cultural archive — Season 01 living editions with music, voice narration, quizzes, and Culture Voices story voting.

## URLs

| Surface | URL |
|---------|-----|
| Atlas app | https://buildingcultureid.space/demo/atlas/ |
| Creator applications | https://buildingcultureid.space/demo/atlas/creators |
| Main app hub | https://app.buildingcultureid.space/creators |

## Repo

`apps/cultureatlasnft` — TanStack Start + Prisma (`culture_atlas` schema) + wagmi.

## Deploy

```bash
npm run deploy:atlas
# or: bash apps/cultureatlasnft/scripts/deploy-atlas.sh
```

Defaults: VPS `root@187.124.18.204`, remote `/var/www/culture-atlas`, port `3012`, nginx subpath `/demo/atlas/`.

## Creator funnel

1. Visitors discover Atlas via main app footer, `/creators`, `/forest`, or `/drops/art`.
2. Apply at `/demo/atlas/creators` (discipline: visual art, music, voice, storytelling, curation).
3. Admin wallets review in Atlas `/admin` → Applications tab (`ADMIN_WALLET_ADDRESSES` in server `.env`).

## Env (Atlas server)

See `apps/cultureatlasnft/.env.example`: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_WALLET_ADDRESSES`, `VITE_BASE_PATH=/demo/atlas/`, web3 addresses for mint/relayer.

## Related docs

- [ADDRESSES.md](./ADDRESSES.md) — ecosystem satellite index
