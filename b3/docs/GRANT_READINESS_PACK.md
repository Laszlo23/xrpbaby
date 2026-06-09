# Grant Readiness Pack — Building Culture

Single entry point for **ecosystem grants** (Base, 0G, Chainlink), **social-impact programs**, and **angel / pre-seed** due diligence.

**Live verifier (share with reviewers):** [https://app.buildingcultureid.space/grant-proof](https://app.buildingcultureid.space/grant-proof)

**Submit to programs (copy-paste pack):** [GRANT_SUBMISSIONS.md](GRANT_SUBMISSIONS.md) · Contact: **laszlo.bihary@gmail.com** · Grant wallet: `0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22`

---

## One-line pitch

**Building Culture** ships culture receipts on-chain: Base mainnet identity and BCC, Places RWA registry/compliance, 0G AgentId for agents, Telegram Mini App growth, and community impact surfaces (Forest, Join, Signal) — verifiable in minutes, not vibes.

---

## Operator workflow

```bash
# From repo root — full gates (exits non-zero on hard failures)
npm run grant:verify

# Bundle JSON + markdown report for grant applications
npm run grant:proof
```

Outputs (gitignored):

- `proof-bundles/grant-proof-<timestamp>.json`
- `proof-bundles/grant-verification-<timestamp>.md`

**Cadence:** run `grant:proof` weekly and before every grant or investor submission.

---

## What reviewers verify (5 minutes)

1. **[Live grant proof](https://app.buildingcultureid.space/grant-proof)** — pass/warn grid + downloadable JSON.
2. **[0G AgentId proof](https://app.buildingcultureid.space/0g/agentid)** — ERC-721 on 0G Chain mainnet.
3. **[On-chain index](ADDRESSES.md)** — Base contracts with Basescan links.
4. **Bytecode audit** — `npm run contracts:audit` (operator-local).
5. **Test snapshot** — [TEST_GATE_SNAPSHOT.json](TEST_GATE_SNAPSHOT.json) (update after full local gates).

---

## Specialized docs

| Audience | Doc |
|----------|-----|
| 0G / hackathon follow-up | [0G_HACKATHON_JUDGE_README.md](0G_HACKATHON_JUDGE_README.md) |
| Places / RWA grants | [apps/places/docs/grants.md](../apps/places/docs/grants.md) |
| Angels / monetization proof | [INVESTOR_PROOF_PLAYBOOK.md](INVESTOR_PROOF_PLAYBOOK.md) |
| Chainlink RWA compliance | [CHAINLINK_RWA_COMPLIANCE.md](CHAINLINK_RWA_COMPLIANCE.md) |
| Contract bytecode snapshot | [CONTRACTS_AUDIT.md](CONTRACTS_AUDIT.md) |

---

## Honest scope boundaries

| Item | Report as |
|------|-----------|
| Base mainnet contracts | Pass when `contracts:audit` OK |
| 0G AgentId | Pass with ChainScan link |
| `/api/trading/health` | Warn until trading sidecar deployed |
| Grove X / Farcaster | Warn until credentials set |
| `ECON_LIVE=0` | Full economics gated — see `deploy/VERIFY_GATE.md` |
| EU impact programs | Narrative + live `/forest` checks — not claimed funding |

---

## Grant application appendix (fill per RFP)

### Problem

Fractional culture and real-estate participation lack **inspectable settlement**, **compliance hooks**, and **portable agent identity** — teams need a reference stack they can deploy, verify, and extend.

### Solution

| Layer | Deliverable |
|-------|-------------|
| **Base** | CultureLayerIdentity, BCC, Places registry/factory/compliance, pulse anchor |
| **0G** | AgentId ERC-721 + in-app proof lane |
| **App** | Wallet auth, marketplace, Telegram Mini App, Forest/Join/Signal |
| **Verification** | `/grant-proof`, `npm run grant:proof`, ADDRESSES.json |

### Traction (cite from latest bundle)

- Production origin live with automated smoke gates.
- On-chain addresses in [ADDRESSES.json](ADDRESSES.json).
- Test counts in [TEST_GATE_SNAPSHOT.json](TEST_GATE_SNAPSHOT.json).

### Security

- Bytecode verification via `contracts:audit`.
- Before retail mainnet with real funds: independent audit, multisig admin, upgraded oracles — see [apps/places/docs/grants.md](../apps/places/docs/grants.md).

### Team & contact

Fill maintainer email / Discord and response time when submitting.

### Budget template

| Line item | Amount | Notes |
|-----------|--------|-------|
| Engineering | | |
| Security audit | | |
| Infrastructure | | |
| Community / impact | | |
| Legal / compliance | | |

---

## Suggested milestones

| ID | Deliverable | Status |
|----|-------------|--------|
| M1 | Open source + docs (this pack) | Met |
| M2 | Base mainnet deployment + ADDRESSES sync | Met |
| M3 | UX, legal transparency, `/grant-proof` | Met |
| M4 | External audit, trading sidecar, `ECON_LIVE` | Roadmap |

---

*Technical summary for reviewers — not a securities disclosure or offer.*
