# Building Culture — Growth Intelligence Agent

AI-powered product intelligence that observes user behavior across the Building Culture ecosystem, identifies friction, and recommends improvements.

**Mission:** Make every Building Culture product smarter every day.

## Philosophy

| Traditional analytics | Growth Intelligence |
|-----------------------|---------------------|
| What happened | Why it happened |
| Dashboards | Recommendations |
| Manual review | Nightly AI analysis |
| Per-product silos | Multi-tenant ecosystem view |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Building Culture Products                     │
│  BC ID · BC App · Ankommen · KinderStimme · RWA · WohnAI · …   │
└────────────┬───────────────────────────────┬────────────────────┘
             │ @bc/growth-intelligence SDK     │ PostHog (optional)
             ▼                                 ▼
┌────────────────────────────┐    ┌──────────────────────────────┐
│  /api/intelligence/ingest  │    │  PostHog API (session replay) │
│  /api/intelligence/session │    │  Heatmaps via PostHog         │
└────────────┬───────────────┘    └──────────────┬───────────────┘
             │                                    │
             ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Prisma)                          │
│  GrowthApp · GrowthSession · GrowthEvent · GrowthFunnel          │
│  GrowthInsight · GrowthRecommendation                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Nightly Analysis (growth-intelligence-analyze)      │
│  Aggregate → Funnel leaks → AI insights → Recommendations        │
└────────────┬────────────────────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dashboard: /intelligence                            │
│  Overview · Heatmaps · Funnels · AI Insights · Recommendations   │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-tenant model

Each monitored product is a `GrowthApp`:

| Slug | Product |
|------|---------|
| `bc-id` | Building Culture ID |
| `bc-app` | Building Culture App |
| `ankommen` | Ankommen Österreich |
| `kinderstimme` | KinderStimme Österreich |
| `community-funding` | Community Funding Platform |
| `rwa-marketplace` | RWA Marketplace |
| `wohnai` | WohnAI |

Apps are isolated by `appId`. API keys (`GI_API_KEY_*`) scope ingest to a tenant.

## Phase rollout

### Phase 1 — Foundation (current)

- [x] Multi-tenant schema
- [x] Client SDK (clicks, scroll, rage/dead clicks, session)
- [x] Ingest API with rate limiting
- [x] Admin dashboard shell
- [x] Nightly rule-based + optional OpenAI analysis
- [x] PostHog bridge (existing `VITE_POSTHOG_*`)

### Phase 2 — Intelligence (current)

- [x] Default ecosystem funnel templates (all tenants)
- [x] Funnel leak detection + dashboard visualization
- [x] Click heatmap aggregation + dashboard
- [x] LLM-enhanced nightly insights (`GI_LLM_ENABLED=1`)
- [ ] PostHog HogQL funnel sync
- [ ] OpenReplay session replay integration
- [ ] BC ID reputation score from activity
- [ ] Weekly product intelligence PDF/email

### Phase 3 — Auto Builder

- [ ] Figma prompt generation
- [ ] Cursor task generation
- [ ] PR draft generation
- [ ] Roadmap synthesis

## SDK integration

```ts
import { initGrowthIntelligence } from "@bc/growth-intelligence";

initGrowthIntelligence({
  appSlug: "bc-id",
  apiKey: import.meta.env.VITE_GI_API_KEY,
  endpoint: "https://app.buildingcultureid.space/api/intelligence",
  maskSelectors: ["[data-gi-mask]", "input[type=password]"],
});
```

Add to any BC product layout. Works alongside PostHog — GI captures granular interaction data; PostHog handles session replay when enabled.

## API

| Route | Method | Role |
|-------|--------|------|
| `/api/intelligence/ingest` | POST | Batch event ingest |
| `/api/intelligence/overview` | GET | Dashboard metrics |
| `/api/intelligence/insights` | GET | Daily/weekly insights |
| `/api/intelligence/recommendations` | GET | Prioritized backlog |

## Grove broadcast

Ship announcements via Grove (X / Telegram / Farcaster):

```bash
cd app
npm run grove:gi:broadcast -- --dry-run   # preview copy
npm run grove:gi:broadcast                # post (one-shot milestone)
npm run grove:gi -- --dry-run             # recurring tick pillar (needs DB)
```

## Nightly analysis

```bash
cd app
npm run gi:analyze          # rule-based + funnel leaks + optional LLM
```

Cron (production):

```
0 2 * * * cd /opt/b3/app && npm run gi:analyze >> /var/log/gi-analyze.log 2>&1
```

## Environment

| Variable | Location | Role |
|----------|----------|------|
| `GI_API_KEY_BC_ID` | server | Ingest auth for BC ID |
| `GI_API_KEY_BC_APP` | server | Ingest auth for BC App |
| `VITE_GI_API_KEY` | client | SDK key (per-app) |
| `VITE_GI_ENABLED` | client | `1` to enable SDK |
| `OPENAI_API_KEY` | server | AI insight generation |
| `POSTHOG_PERSONAL_API_KEY` | server | Phase 2 funnel sync |

## Revenue tiers (product)

| Tier | Price | Features |
|------|-------|----------|
| Free | €0 | Heatmaps, basic analytics |
| Pro | €19/mo | AI reports, session replay |
| Business | €49/mo | Recommendations, funnel intelligence |
| Enterprise | €99+/mo | Auto builder, multi-app, community intelligence |

Tier enforcement is Phase 2 (Stripe integration).

## Privacy & GDPR

- Passwords and PII masked client-side via `maskSelectors`
- Session IDs are anonymous until wallet/identity link
- IP addresses hashed at ingest
- Data retention: 90 days events (configurable per tenant)
- Export/delete: Phase 2 admin tools

## Related docs

- [GROWTH_AUTOMATION_RUNBOOK.md](./GROWTH_AUTOMATION_RUNBOOK.md) — SEO/blog ops (separate from GI)
- [app/AGENTS.md](../app/AGENTS.md) — Platform API reference
