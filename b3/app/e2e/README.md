# End-to-end tests (`e2e/`)

## Spec files

| File | Scope |
|------|--------|
| `smoke.spec.ts` | Fast CI gate — routes, SEO, core APIs |
| `landing.spec.ts` | Story landing, CTAs, waitlist |
| `onboarding.spec.ts` | `/join` flow and back link |
| `forest.spec.ts` | Community hub modules and chrome |
| `play.spec.ts` | Drops home and bottom nav |
| `signal.spec.ts` | Culture Pulse page |
| `shell.spec.ts` | BottomNav / footer visibility |

Shared setup: `fixtures/skip-onboarding.ts` (skips Elias modal), `fixtures/api-helpers.ts`, `fixtures/mock-siwe.ts`.

## Running

Playwright runs against **production-like** SSR: `npm run build` then `npm run start` (see `playwright.config.ts`).

```bash
npm run test:smoke          # all specs in e2e/
npx playwright test e2e/landing.spec.ts
```

Do **not** set `PLAYWRIGHT_REUSE_SERVER=1` unless port `3000` is already running **this app’s** SSR server.

## Unit tests

Server tests under `src/server/**` — **`npm run test:unit`**. Included in **`npm run test:all`** with verify + smoke.

## Optional: wallet + chain (Anvil / fork)

Full **connect wallet → sign tx** flows are gated by `CI_WALLET_E2E=1`:

1. Anvil fork of Base at a pinned block
2. Point RPC env at localhost for Playwright build
3. `e2e/wallet.spec.ts` (when added) with injected wallet

Default CI stays fast without chain infra.
