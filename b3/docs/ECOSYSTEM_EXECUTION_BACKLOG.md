# Ecosystem execution backlog (next 30-90 days)

Execution tickets derived from:

- [ECOSYSTEM_GOALS_AND_ROADMAP.md](./ECOSYSTEM_GOALS_AND_ROADMAP.md)
- [MISSING_AND_FIXES.md](./MISSING_AND_FIXES.md)
- [OBSERVABILITY.md](./OBSERVABILITY.md)

Use this as the canonical implementation queue for ecosystem goals.

## Prioritization model

- **P0**: blocks KPI visibility, conversion health, or trust.
- **P1**: materially improves growth/retention and delivery speed.
- **P2**: quality and scale hardening.

## P0 tickets (start now)

### ECO-001 — Production Pulse and market health stabilization

- **Priority:** P0
- **Owner:** Platform ops
- **Goal/KPI link:** Pulse data health, Market health baseline, Reliability score
- **Problem:** Grove briefs and operator trust degrade when `/api/pulse/metrics` or `/api/market/bcc` is unhealthy.
- **Scope:**
  - Verify uptime and payload validity for:
    - `GET /api/pulse/metrics`
    - `GET /api/pulse/digest/:date`
    - `GET /api/market/bcc`
  - Add explicit alert routing to Slack for endpoint failures.
  - Document fallback behavior (Dex snapshot) in ops runbook.
- **Definition of done:**
  - 7 consecutive days with no unresolved endpoint outage.
  - Alert path documented and tested.
  - Grove brief fields non-null for >=95% of daily runs.
- **Dependencies:** `PULSE_CRON.md`, `ON_CHAIN_MARKETING_AGENT.md`, deployment env parity.

### ECO-002 — Agent-attributed funnel dashboard v1

- **Priority:** P0
- **Owner:** Growth owner
- **Goal/KPI link:** Agent-attributed joins, Join -> pass conversion, WAU
- **Problem:** Attribution exists but decision-quality dashboarding is not consistently maintained.
- **Scope:**
  - Build dashboard with funnel:
    - `landing_view` -> `wallet_connected` -> `mint_clicked` -> `mint_confirmed`
  - Segment by `agent_ref`, channel UTM, and landing route.
  - Add weekly export or screenshot ritual for monthly review.
- **Definition of done:**
  - Dashboard shared with growth/product/ops.
  - Weekly cadence in place (owner + day).
  - Baseline conversion values recorded in roadmap decision log.
- **Dependencies:** `app/src/lib/analytics.ts`, PostHog event hygiene.

### ECO-003 — Canonical front-door consistency in production

- **Priority:** P0
- **Owner:** Platform ops + Product owner
- **Goal/KPI link:** Reliability score, Ecosystem cross-traffic, conversion quality
- **Problem:** Split/legacy domain behavior creates narrative and measurement leakage.
- **Scope:**
  - Apply production nginx 301 rules for canonical host behavior.
  - Verify ecosystem links and auth return paths default to `app.buildingcultureid.space`.
  - Keep all default app/auth routes on `*.buildingcultureid.space`.
- **Definition of done:**
  - Redirect behavior validated by smoke checks in production.
  - No primary CTA in docs/app points to legacy host as default.
  - Auth relay exceptions explicitly documented.
- **Dependencies:** `DOMAIN_CUTOVER.md`, `CROSS_DOMAIN_UNIFIED_ENTRY.md`, `MISSING_AND_FIXES.md`.

## P1 tickets (this sprint)

### ECO-004 — BCC utility reporting loop

- **Priority:** P1
- **Owner:** Token ops
- **Goal/KPI link:** BCC utility usage, Market health baseline
- **Problem:** Utility mechanics exist, but weekly reporting is not standardized.
- **Scope:**
  - Define weekly BCC utility report template:
    - discount tx count
    - settled BCC owed/credited
    - liquidity and 24h volume trend
  - Publish in ops channel each week.
- **Definition of done:**
  - First 4 weekly reports published.
  - Metrics source documented in roadmap.
- **Dependencies:** `BCC_TOKEN.md`, settlement queue/log access.

### ECO-011 — Points → BCC redemption pipeline

- **Priority:** P1
- **Owner:** Token ops + Platform engineering
- **Goal/KPI link:** BCC utility usage, Culture Points retention
- **Problem:** Culture Points ledger is live but redemption was policy-only.
- **Scope (shipped):**
  - `PointRedemption` model + `POST /api/points/redeem` (SIWE treasury transfer)
  - `PointsRedeemSection` on `/profile` and `/wallet`
  - `bcc-settlement-keeper` for Stripe `BccSettlement` queue
  - `points:airdrop-snapshot` + `POST /api/airdrop/claim`
  - Founding XP import via `POST /api/points/import-founding-xp`
- **Definition of done:**
  - Ops enables `POINTS_REDEEM_ENABLED=1`, sets `POINTS_PER_BCC_WEI`, funds treasury
  - Combined TVL ≥ $500k; first successful mainnet redeem logged
  - Keeper runbook in `BCC_TOKEN.md` exercised once (dry-run + live)
- **Dependencies:** [SMART_WALLET_AND_PACKS.md](./SMART_WALLET_AND_PACKS.md), [BCC_TOKEN.md](./BCC_TOKEN.md), [TREASURY_POLICY.md](./TREASURY_POLICY.md)

### ECO-010 — BCC liquidity learn hub + Aerodrome secondary pool

- **Priority:** P1
- **Owner:** Token ops + Product engineering
- **Goal/KPI link:** Market health baseline, BCC utility loop
- **Problem:** No unified education surface for BCC LP; Aerodrome secondary pool not configured.
- **Scope:**
  - `/liquidity` learn hub + `GET /api/market/bcc` dual-pool stats (shipped in app).
  - Telegram modules `m_bcc_liquidity_basics`, `m_aerodrome_gauges`.
  - Operator: seed Aerodrome BCC/WETH pool per [BCC_AERODROME_LIQUIDITY.md](./BCC_AERODROME_LIQUIDITY.md).
- **Definition of done:**
  - Production `/liquidity` live; Culture Points quests crediting.
  - `VITE_BCC_AERODROME_*` set after pool deploy; LP proof quest verifiable.
- **Dependencies:** [BCC_LIQUIDITY_LEARN.md](./BCC_LIQUIDITY_LEARN.md), treasury seed decision.

### ECO-005b — BC Studio VPS sandboxes + publish

- **Priority:** P1
- **Owner:** Infra + Product engineering
- **Goal/KPI link:** Builder adoption, Ecosystem cross-traffic
- **Problem:** BC Studio code ships in unified app but preview/publish need VPS Docker orchestrator and CreateOS credentials.
- **Scope:**
  - Deploy `bc-studio-sandbox` image + `scripts/studio-orchestrator` on VPS.
  - Set `STUDIO_SANDBOX_*` and `CREATEOS_*` in production `deploy/.env`.
  - Wildcard or per-slug nginx for `{slug}.buildingcultureid.space` community apps.
- **Definition of done:**
  - Member can prompt, preview live, export, and publish to BC subdomain.
- **Dependencies:** [BC_STUDIO.md](./BC_STUDIO.md), CreateOS API key.

### ECO-005a — Impact product DNS + nginx cutover (Ankommen + KinderStimme)

- **Priority:** P1
- **Owner:** Infra / Ecosystem owner
- **Goal/KPI link:** Impact product WAU, Ecosystem cross-traffic
- **Problem:** Ankommen AI and KinderStimme are registered in the BC app but subdomains are not yet live.
- **Scope:**
  - DNS A/AAAA for `ankommen.buildingcultureid.space` and `forkids.buildingcultureid.space`.
  - Nginx reverse proxy per `infra/nginx-ankommen-buildingculture.example.conf` and `infra/nginx-forkids-buildingculture.example.conf` (interim: proxy to `ankommen.ai` / `kinderstimme.at`).
  - Add both hosts to production `CORS_ORIGIN` and `SIWE_ALLOWED_DOMAINS` (see `deploy/.env.example`).
- **Definition of done:**
  - Both subdomains resolve with valid TLS and serve the beta products.
  - Landing ecosystem + forest cards open without mixed-content or CORS errors.
- **Dependencies:** `ADDRESSES.md`, `DOMAIN_CUTOVER.md`, VPS/nginx access.

### ECO-005 — External ecosystem link and auth parity pass

- **Priority:** P1
- **Owner:** Ecosystem owner
- **Goal/KPI link:** Ecosystem cross-traffic
- **Problem:** Some ecosystem surfaces still route inconsistently and reduce measurable cross-flow.
- **Scope:**
  - Validate BCDAI/founding/partner links and return paths.
  - Ensure shared auth/member sync compatibility for key satellites.
  - Add link QA checklist to monthly review.
- **Definition of done:**
  - Link matrix completed and green for all active satellites.
  - Broken or stale ecosystem links removed or corrected.
- **Dependencies:** `BCDAI_ECOSYSTEM.md`, `SMART_WALLET_AND_PACKS.md`.

### ECO-006 — `apps/identity` wagmi v3 alignment plan + execution

- **Priority:** P1
- **Owner:** Product engineering
- **Goal/KPI link:** Join -> pass conversion, Reliability score
- **Problem:** Version drift increases auth/wallet risk and slows issue resolution.
- **Scope:**
  - Prepare migration checklist and execute upgrade.
  - Validate pass mint flow and wallet connection parity.
- **Definition of done:**
  - `apps/identity` on wagmi v3 with no critical regression.
  - Smoke tests pass for identity path.
- **Dependencies:** current monorepo wallet stack and test coverage.

## P2 tickets (stability and quality)

### ECO-007 — Chain E2E enablement in CI baseline

- **Priority:** P2
- **Owner:** Platform ops + QA
- **Goal/KPI link:** Reliability score
- **Scope:** Add scheduled or gated `CI_WALLET_E2E=1` run, publish result trend.
- **Definition of done:** Weekly CI evidence for wallet/mint path.

### ECO-008 — Legacy host reference cleanup in Elias corpus + copy pass

- **Priority:** P2
- **Owner:** Product content + Data owner
- **Goal/KPI link:** Conversion quality, narrative cohesion
- **Scope:** Remove stale `.capital` host references in seed/content paths where no longer canonical.
- **Definition of done:** Legacy references reduced to approved technical exceptions.

### ECO-009 — Repo-wide formatting reliability pass

- **Priority:** P2
- **Owner:** Platform ops
- **Goal/KPI link:** Delivery speed and CI reliability
- **Scope:** Resolve Prettier drift and lock consistent verify behavior.
- **Definition of done:** `npm run verify` stable for routine doc/app changes.

## Suggested sprint cut (next 14 days)

Take into active sprint:

1. ECO-001
2. ECO-002
3. ECO-003
4. ECO-004

Keep ready next:

1. ECO-005
2. ECO-006

## Weekly operating rhythm

- **Monday:** review P0 ticket states + previous week KPI deltas.
- **Wednesday:** endpoint and funnel health checkpoint.
- **Friday:** publish weekly utility + growth summary and carryover risks.

## Execution board template

Use these columns in your tracker:

- `Backlog`
- `Ready`
- `In Progress`
- `Blocked`
- `Review`
- `Done`

Required fields per ticket:

- ID
- Owner
- KPI link
- DoD
- Due date
- Risk notes
