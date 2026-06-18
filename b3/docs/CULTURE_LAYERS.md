# Culture Layer Stack

Canonical five-layer model for Building Culture. Layer 1 is the foundation; Layer 5 is capital.

**Source of truth (code):** [`app/src/lib/culture-layers.ts`](../app/src/lib/culture-layers.ts)

**Standalone mirror:** `buildingculturelanding-main/frontend/src/lib/cultureLayers.js` (keep in sync)

## Stack

| Layer | Name | Sub-items |
| ----- | ---- | --------- |
| 1 | Community | People, Stories, Projects, Places |
| 2 | Identity | .culture, Credentials, Culture Reputation, Linked wallets |
| 3 | Agents | Research Agent, Marketing Agent, Grant Agent, Builder Agent |
| 4 | Economy | Marketplace, Services, Creator Economy |
| 5 | Capital | BCC Token, Treasury, Agent Shares |

## Route map

| Layer | Sub-item | Route | Status |
| ----- | -------- | ----- | ------ |
| Community | People | `/team` | Live |
| Community | Stories | `#stories` | Live (landing section) |
| Community | Projects | `/studio` | Live |
| Community | Places | `/places` | Live |
| Identity | .culture | `/pass` | Live |
| Identity | Credentials | `/credentials` | Live |
| Identity | Culture Reputation | `/id/laszlo.culture/reputation` | Live |
| Identity | Linked wallets | `/pass` | Live (EVM + XRPL Phase 1) |
| Agents | Research Agent | `/agent-os` | Live (x402) |
| Agents | Marketing Agent | `/agent-os` | Beta (Grove) |
| Agents | Grant Agent | `/grant-proof` | Beta |
| Agents | Builder Agent | `/studio` | Beta (BC Studio) |
| Economy | Marketplace | `/marketplace` | Live |
| Economy | Services | `/agent-os` | Live (paid agent services) |
| Economy | Creator Economy | `/creators` | Live |
| Capital | BCC Token | `/bcc` | Live |
| Capital | Treasury | `/bcc/dashboard` | Live |
| Capital | Agent Shares | `/campaign` | Live |

## Agents: Layer 3 vs Agent Share fleet

**Layer 3 agents** (Agent OS service catalog) — see [`agentos/building_culture_seed.json`](../agentos/building_culture_seed.json):

| Agent | Implementation |
| ----- | -------------- |
| Research Agent | x402 API, `/api/agents/research` |
| Marketing Agent | Grove (`ops/agents.json`, `/api/marketing/grove/*`) |
| Grant Agent | Grant Proof UI + catalog |
| Builder Agent | BC Studio (`app/src/server/studio/agent.ts`) |

**Agent Share NFTs** (Capital sub-item) — separate 11-type fleet in `packages/bcd-orchestration/src/fleet.ts` for onchain monetization via `/campaign`. Not the same ID space as Agent OS.

Internal agents (Chief of Staff, Content, Community, Growth) remain in `SECONDARY_AGENTS` in `agent-os-catalog.ts` but are not part of the Layer 3 public stack.

## Related taxonomies

- **Ecosystem product tags** (`vision`, `core`, `ai`, etc.) in `app/src/lib/ecosystem-layers.ts` — used for the product orbit UI, not this stack.
- **On-chain `.culture` namespace** — `CultureLayerIdentity` / V2 contracts; “Culture Layer” in product copy often refers to this identity TLD, not the five-layer marketing stack.

## Landing UI

Interactive layer explorer on the landing page:

- Left: layer selectors (Layer 05 Capital at top → Layer 01 Community at bottom)
- Right: detail panel with sub-item cards linking to routes above
- Default selection: Community (Layer 1)

Implemented in `app/src/components/landing/LandingCultureLayer.tsx`.
