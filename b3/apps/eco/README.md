# Building Culture — Revival & eco hubs (landing)

This app is the **physical-lane** front door: community-owned revival, Austria hubs (e.g. Bernhardsthal), and nomad/builder narrative. The **digital-lane** experience market (ticket NFTs, draws, BCD) lives at the BUILDCHAIN app — linked via `VITE_BUILDCHAIN_APP_URL`.

## Hosting decision (multi-app architecture)

**Chosen approach: Option A — separate deploy (subdomain or path on CDN).**

- Keeps this **Vite + React 18 + shadcn** stack independent from [`../frontend`](../frontend) (TanStack Start, wagmi, heavier SSR bundle).
- Deploy output of `npm run build` as **static files** (S3, nginx, Cloudflare Pages, etc.) or a tiny static host.
- Recommended hostnames: `eco.buildingculture.capital`, `hubs.buildingculture.capital`, or a path on your marketing domain — match `PUBLIC` / nginx config.

To integrate later (Option B): port sections into `../frontend` as `/revival` routes — possible, but not required for launch.

## Environment

Copy [`.env.example`](./.env.example) to `.env` and set URLs for your deployment.

| Variable | Purpose |
|----------|---------|
| `VITE_BUILDCHAIN_APP_URL` | Main game app (default `https://0x.buildingculture.capital`) |
| `VITE_ECO_HUB_LANDING_URL` | Canonical URL of **this** site (OG / footer self-link; optional) |
| `VITE_COMMUNITY_X_URL` | X/Twitter link for footer |
| `VITE_CONTACT_EMAIL` | Optional `mailto:` for footer contact |

## Scripts

```bash
npm ci
npm run dev      # http://localhost:8080
npm run build    # dist/ for static hosting
```

## Cross-links

Primary CTAs point to the BUILDCHAIN app; that app links back when `VITE_ECO_HUB_LANDING_URL` is set in the main frontend `.env`.
