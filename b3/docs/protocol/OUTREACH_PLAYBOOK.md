# BCID Outreach Playbook

Human-approved agent-assisted outreach for DAO pilots, L2 foundations, and identity protocol partnerships.

**Constraint:** Agents draft; humans send. No autonomous cold email at scale — see [X_SSH_SOCIAL_AGENT.md](../X_SSH_SOCIAL_AGENT.md).

---

## Funnel architecture

```
Agent scans targets → drafts email + forum post + follow-ups
     → Operator reviews at /ops/outreach
     → Approve → Send via Resend from hello@buildingcultureid.space
     → Track status in OutreachCRM
     → Replies → Plain MCP / tagged inbox
```

---

## Target segments

| Segment | Channel | Ask |
|---------|---------|-----|
| L2 foundations | Grant boards, forum posts | Retro funding + identity pilot |
| DAO tooling | Partnership email | BCID as voter/applicant credential |
| Identity protocols | EAS Discord, ERC-8004 | Interop + schema alignment |
| RWA / regen DAOs | Forum + email | Registry + compliance story |
| Hackathons | HackQuest, ETHGlobal | BCID as submission identity |

---

## Weekly rhythm

| Day | Action |
|-----|--------|
| Monday | Run `npm run grant:proof` — attach fresh bundle to touches |
| Tuesday | Agent drafts for 2–3 targets; operator approves |
| Wednesday | Forum posts (Base, EAS) — no email needed |
| Thursday | Follow-up drafts for `contacted` targets |
| Friday | Grove amplifies grant-proof + RFC link |

---

## Email template (agent seeds)

**Subject:** BCID pilot — portable builder identity for {DAO_NAME} grants

**Body:**

```
Hi {CONTACT_NAME},

I'm Laszlo from Building Culture. We shipped BCID — a soulbound builder identity that complements ENS and EAS — and we're offering free pilots to 3–5 DAOs.

What you get:
- Contributor BCIDs (mint or bridge from .culture)
- dao-member + grant-applicant credentials
- Public resolve API — no indexer required for v1

Live proof (36+ automated checks): https://app.buildingcultureid.space/grant-proof
Partnership brief: https://app.buildingcultureid.space/docs/bcid
Feedback: https://app.buildingcultureid.space/voice

Would a 20-min call next week work to explore Path A (grant applicant ID) or Path B (member gating)?

Best,
Laszlo · hello@buildingcultureid.space
```

---

## Forum playbook (no email)

| Platform | Action |
|----------|--------|
| Base Discord `#show-your-work` | Grant-proof + BCID one-liner weekly |
| EAS forum | Schema proposal: BC builder credential |
| ERC-8004 / 8004scan | Register Limx/Grant agent with BCID policy |
| Commonwealth / Snapshot forums | Partnership RFC for pilot DAOs |
| Paragraph / Mirror | Publish BCID Lite Paper |

---

## CRM status flow

```
prospect → contacted → pilot → closed_won
                      ↘ closed_lost
```

Touch status: `draft` → `approved` → `sent`

---

## Inbound routing

Replies to `hello@buildingcultureid.space`:
1. Plain MCP thread tagged `outreach`
2. Agent summarizes → operator responds
3. Link thread to `OutreachTarget` notes

---

## Files

| File | Purpose |
|------|---------|
| `/ops/outreach` | Human approval UI |
| `scripts/seed-outreach-targets.mjs` | 10 curated targets |
| `docs/protocol/DAO_PARTNERSHIP_BRIEF.md` | Attach to every touch |
| `proof-bundles/grant-verification-*.md` | Weekly proof attachment |

---

## KPIs (4-week)

| Metric | Target |
|--------|--------|
| Targets seeded | 10 |
| Touches sent (human-approved) | 15+ |
| Forum posts published | 4+ |
| Pilot DAOs in conversation | 3 |
| RFC comments | 5+ |
