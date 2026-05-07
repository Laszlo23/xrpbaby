# Pre-launch verification gate (`ECON_LIVE=1`)

Do **not** set `ECON_LIVE=1` in production until **all** items below are true.

## On-chain / custody

- [ ] All four Phase-1 contracts are owned by the planned **Safe** (explorer shows `owner` = Safe address):
  - BuildingCultureDollar
  - BCDGenesisClaim
  - RaffleTicketCampaign
  - AgentShareCampaign
- [ ] Raffle v2 (or current audited revision) deployed; `entropyBlock` semantics verified on Base (`close()` sets entropy; `revealDraw` reverts before `entropyBlock + 1`).
- [ ] AGS / vault contracts with **`Pausable`**: pause and unpause exercised once from the Safe.
- [ ] BCD `ownerMintDisabled` is **true**, or genesis window still open with `disableOwnerMintForever()` queued for right after window end.

## Data / infra

- [ ] `npx prisma migrate deploy` completes cleanly on production Postgres; `ChainMintEvent` (and related) tables exist.
- [ ] Indexer cron (`chain:index` / indexer container) has caught up; `/agent-fleet` shows **Indexed AGS mints** &gt; 0 once mints exist on-chain.
- [ ] Strapi: `community_wallet_nonces` table exists (SIWE bootstrap); public CMS permissions narrowed per runbook (`deploy/README.md` § Strapi bootstrap).

## Observability & process

- [ ] Sentry (or equivalent) receiving frontend errors in the production project.
- [ ] Agent-runtime ledger shows **7+ days** of dry-run rows with `AGENTS_PAUSED=1` / `ECON_LIVE=0` before economics go live.
- [ ] External audit report published; remediations merged to the release branch.

## Legal / product

- [ ] `/legal/terms`, `/legal/privacy`, `/legal/imprint`, `/legal/cookies` use counsel-approved copy; remove any “Counsel review required” banner.

## DNS / edge

- [ ] TLS live for `app.<domain>` and `api.<domain>` (see `deploy/nginx.conf.example` or Caddy).
