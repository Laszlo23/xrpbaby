# ERC-8004 agent registry checklist

When public HTTPS endpoints and agent metadata are stable:

1. **Collect per agent** — `id`, `handler`, role, policy summary, status URL (`/api/agents/status`), contact.
2. **Verify** on [8004scan](https://8004scan.io) (or current canonical registry UI) per their submission form.
3. **Pin** — document transaction hashes / registry IDs in ops notes (not secrets).

Fleet definitions live in `ops/agents.json`; runtime ledger in Postgres `AgentActionLog`.

**Elias Concierge (`elias-concierge-1`)** — guest-facing BUILDCHAIN route `/elias`; policy: no partner email without in-app approval; major actions logged (`elias.plan_*`). Inbound partner packages: `POST /api/elias/inbound` (optional header `x-elias-inbound-secret`).

*Registration is manual. Future automation must propose registration transactions through the canonical Safe (`0xCe03F6E734cC48393Ce41b257E998c68b521EB5c` on Base, see `TREASURY_POLICY.md`) and require an owner-threshold confirmation; no hot-EOA signing.*

## Suggested “CEO Agent” registry entry (safe default)

- **Intent**: registry/profile entry only (discoverability + policy), not a hot wallet with treasury authority.
- **Handler**: use the canonical Safe on Base: `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`.
- **Status URL**: `GET /api/agents/status` (public JSON snapshot).
- **Policy summary**: no unilateral control of protocol funds; any onchain action must be proposed/approved via Safe; ops wallets are limited-float; `AGENTS_PAUSED` kill-switch available.
