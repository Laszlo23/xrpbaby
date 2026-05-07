# Unified ingress across `.capital` hostnames

The app shell cannot replace DNS on its own. Use this playbook when collapsing **Eco**, **Capital**, **0x**, and **App** behind one “front door.”

## Recommended patterns

**Path-based reverse proxy**

- Canonical apex (e.g. `buildingculture.capital`) terminates TLS.
- Route examples (illustrative):
  - `/` → marketing splash or redirect to `/app`
  - `/app/*` → `app.buildingculture.capital`
  - `/eco/*` → `eco.buildingculture.capital`
  - `/0x/*` → `0x.buildingculture.capital`
- Keeps SSR/CORS headers explicit; avoids cookie fragmentation if subdomains diverge.

**Hub page + deeplinks**

- Minimal gateway page with curated CTAs mirrors [`bc-touchpoints`](../frontend/src/lib/bc-touchpoints.ts).
- Faster to ship when infra cannot change quickly.

## Product alignment with Elias

- **Orb + intent quiz** expect consistent public URLs documented in [`bc-touchpoints`](../frontend/src/lib/bc-touchpoints.ts); update both when marketers change domains.
- **Farcaster / frames** inherit `PUBLIC_APP_ORIGIN` plus hash routes — gateway must preserve frame meta headers.

## Checklist before cutover

- [ ] Decide canonical apex hostname + redirects (301 chart).
- [ ] Verify Strapi/CMS absolute URLs referenced in embeddings / corpus snippets.
- [ ] Warm caches/CDN purge after proxy changes.
- [ ] Validate wallet connect origins + SIWE domains allowlist (`SIWE_ALLOWED_DOMAINS`).

## Related code

- In-app canonical list: [`frontend/src/lib/bc-touchpoints.ts`](../frontend/src/lib/bc-touchpoints.ts)
- Embedding metadata builder: [`frontend/src/lib/farcaster-embed-meta.ts`](../frontend/src/lib/farcaster-embed-meta.ts)
