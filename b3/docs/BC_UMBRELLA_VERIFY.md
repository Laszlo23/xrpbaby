# BC umbrella shared layer — verification notes

## Green

- `npm run build` in **`b3/packages/contracts-sdk`**, **`registry`**, **`proof`**, **`identity`**, **`wallet-kit`**
- `npm run build` in **`b3/frontend`** (Vite production)
- `npm run build` in **`b3/ecorwa`** (includes optional `@bc/wallet-kit` + `VITE_ENABLE_WEB3`)
- `npm run build` in **`b3/strapiapp`** after pinning **`@strapi/admin`** to **`5.34.0`** (same line as `@strapi/strapi`). A loose transitive range had resolved admin **5.44.x**, whose `ee.mjs` exports **`useGetAiFeatureConfigQuery`** (different casing) — incompatible with **`@strapi/content-manager@5.34.0`**, which imports **`useGetAIFeatureConfigQuery`**.

## Strapi (`b3/strapiapp`)

- **`b3/strapiapp/package.json`** lists **`@strapi/admin": "5.34.0"`** explicitly so the admin bundle matches the rest of the Strapi 5.34 stack. `@bc/identity` wiring in `community-profile.js` remains standard CJS `require('@bc/identity/server')` — see `strapiapp/docs/IDENTITY_PACKAGING.md`.

## Frontend Playwright (`test:smoke`)

- WebServer (`npm run dev`) hit **SSR** errors: `Objects are not valid as a React child` during `renderToPipeableStream`. This persisted after reverting `Web3Provider` / `chains` / `wagmi-config` to pre–wallet-kit in-app implementations, so it is likely **environment / dependency tree** (hoisted workspaces) rather than the `@bc/*` source alone.
- **Mitigation in-repo:** `frontend/vite.config.ts` sets `resolve.dedupe` for `react` / `react-dom` and `ssr.noExternal` for `@bc/contracts-sdk`, `@bc/proof`, `@bc/identity`, `@bc/registry`.
- **Next steps:** if smoke still flakes, run from a clean `frontend`-only install; re-tune `noExternal` if a specific workspace package still pulls a second React copy.

## Frontend vs `@bc/wallet-kit`

- **`b3/frontend`** keeps **local** `chains.ts` + `wagmi-config.ts` + `Web3Provider` to avoid the SSR duplicate-React issue above.
- **`b3/ecorwa`** uses **`@bc/wallet-kit`** (`createWagmiConfig`, `Web3Provider` with `includeQueryClient={false}`) behind **`VITE_ENABLE_WEB3`**.
