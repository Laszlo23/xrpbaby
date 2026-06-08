# Ecosystem goals and roadmap

This is the canonical strategy document for Building Culture ecosystem execution.

Canonical product entrypoint: `https://app.buildingcultureid.space`.

Execution queue: [ECOSYSTEM_EXECUTION_BACKLOG.md](./ECOSYSTEM_EXECUTION_BACKLOG.md).
Emergency compression mode: [BLITZ_48H_WAR_ROOM.md](./archive/BLITZ_48H_WAR_ROOM.md).

## North star

Build a proof-first on-chain culture ecosystem where community actions, identity, and utility are measurable, attributable, and compounding across products.

## Strategic pillars

| Pillar | Goal |
|--------|------|
| Community activation | Grow weekly active members and meaningful participation in `/join`, `/forest`, and `/signal` |
| Identity and ownership | Increase verified `.culture` identity adoption with low-friction mint flow |
| BCC utility loop | Make BCC useful across core surfaces with clear, non-speculative value |
| Agent-driven growth | Use Grove and partner agents to acquire and retain members through attributable flows |
| Ecosystem orbit | Drive qualified traffic and conversions between app, BCDAI, founding, and partner surfaces |
| Social impact (Austria) | Grow beta adoption of Ankommen AI and KinderStimme as BC-operated public-good products |

## Canonical language policy

- Use **BCC** in all current public-facing narrative.
- Use **BCD** only in historical launch/runbook context where contract labels are still BCD-era.
- Use `app.buildingcultureid.space` as the default user-facing entrypoint.
- Keep all public hosts on `*.buildingcultureid.space`; avoid routing new traffic through legacy non-`buildingcultureid.space` domains.
- Public copy stays proof-first and community-first; no speculative yield or price-target messaging.

## 90-day objectives

### Objective 1: Unify ecosystem narrative and docs

Success criteria:

- All active docs listed in `docs/README.md` with status tags.
- Legacy docs clearly labeled and linked to canonical replacements.
- Token/domain naming contradictions removed from priority docs.

### Objective 2: Improve activation and conversion quality

Success criteria:

- Increase join-to-mint conversion from agent-attributed traffic.
- Keep one canonical CTA path per channel (`/join`, `/pass`, `/signal`).
- Ensure production Pulse + market endpoints are healthy and feeding Grove briefs.

### Objective 3: Strengthen BCC utility and trust

Success criteria:

- BCC utility language consistent across token, marketing, and product docs.
- Discount mechanics (`11.11%`) documented and mapped to production rails.
- Weekly utility reporting visible to operators (discount usage, settlement flow, market health).

### Objective 4: Operationalize ecosystem review cadence

Success criteria:

- Monthly KPI review performed and documented by owner.
- Open platform debt linked to ecosystem outcomes, not only technical backlog.
- Priority gaps in `docs/MISSING_AND_FIXES.md` updated after each review cycle.

## KPI scoreboard

| KPI | Definition | Data source | Owner | Target cadence |
|-----|------------|-------------|-------|----------------|
| WAU (ecosystem) | Weekly active wallets/members across core app flows | PostHog + `POST /api/wallet/sync` records | Growth owner | Weekly |
| Agent-attributed joins | `agent_ref=*` visits reaching join success | `app/src/lib/analytics.ts` events in PostHog | Grove owner | Weekly |
| Join -> pass conversion | Percentage of joiners that mint identity pass | PostHog funnel + on-chain mint reads | Product owner | Weekly |
| Pulse data health | `% successful` Pulse ingest and digest generation | `PULSE_CRON.md` jobs + observability checks | Platform ops | Daily |
| BCC utility usage | Count/value of BCC discount transactions | App settlement logs + contract/app events | Token ops | Weekly |
| Market health baseline | BCC liquidity, 24h volume, buys/sells | `GET /api/market/bcc` + Dex fallback | Token ops | Daily |
| Ecosystem cross-traffic | Click-through from core app to BCDAI/founding/partners and return | Landing ecosystem analytics + UTM/agent_ref | Ecosystem owner | Weekly |
| Impact product WAU | Weekly active users on Ankommen + KinderStimme BC subdomains | Product analytics (PostHog) per satellite | Impact owner | Monthly |
| Reliability score | Production smoke pass rate for core routes | `scripts/production-smoke.sh` | Platform ops | Weekly |

## KPI to observability map

| KPI family | Primary endpoint/event | Secondary check |
|------------|------------------------|-----------------|
| Growth attribution | `agent_ref` funnel (`landing_view`, `wallet_connected`, `mint_clicked`, `mint_confirmed`) | Grove tick output and campaign logs |
| Pulse integrity | `GET /api/pulse/metrics`, `GET /api/pulse/digest/:date` | On-chain attestation tx from `pulse:attest` |
| Market and utility | `GET /api/market/bcc`, settlement queue status | DexScreener snapshot when API degraded |
| Platform reliability | `./scripts/production-smoke.sh https://app.buildingcultureid.space` | `docs/OBSERVABILITY.md` alert checks |

## Monthly ecosystem review ritual

Schedule: first business Monday of each month.

Participants:

- Growth owner (chair)
- Product owner
- Platform ops owner
- Token ops owner

Meeting checklist:

1. Review KPI scoreboard for prior month.
2. Compare against 90-day objective trajectory.
3. Identify top 3 blockers and top 3 leverage opportunities.
4. Update `docs/MISSING_AND_FIXES.md` with outcome-linked actions.
5. Update `docs/README.md` statuses if any docs changed lifecycle.
6. Record decisions and owner assignments in this file.

## Current focus (next 30 days)

1. Finalize canonical narrative alignment across README, token docs, and Grove doc.
2. Close production endpoint reliability gaps affecting Pulse/market briefs.
3. Tighten agent-attributed funnel instrumentation and dashboard quality.
4. Reframe or archive BCD-era product map docs to prevent external confusion.

## Decision log

| Date | Decision | Owner |
|------|----------|-------|
| 2026-06-04 | Canonical front door set to `app.buildingcultureid.space` for ecosystem docs | Product + Ops |
| 2026-06-04 | BCC canonical naming adopted; BCD retained only for legacy historical references | Product + Token ops |
| 2026-06-05 | Ankommen AI + KinderStimme registered as BC impact products at `ankommen.` / `forkids.` subdomains (beta) | Product + Ecosystem |
