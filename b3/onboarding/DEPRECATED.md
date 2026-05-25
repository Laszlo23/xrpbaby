# Onboarding landing (DEPRECATED)

**This CRA + FastAPI stack is deprecated.** The full story landing now lives in the unified TanStack app:

- **Route:** `/` in `app/`
- **Components:** `app/src/components/landing/*`
- **Waitlist:** `POST /api/platform/waitlist` (Postgres)

Keep this folder for reference during cutover only. Do not deploy to production after nginx points all paths to TanStack.

See [docs/DOMAIN_CUTOVER.md](../docs/DOMAIN_CUTOVER.md).
