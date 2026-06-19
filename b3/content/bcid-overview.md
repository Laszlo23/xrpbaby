# BCID — Building Culture Identity

**One-page overview** · v1 draft · [Lite paper](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/BCID_LITE_PAPER.md) · [RFC](https://app.buildingcultureid.space/docs/rfc)

---

## What is BCID?

**Building Culture Identity (BCID)** is a soulbound, portable identity standard for builders, DAOs, and agents. It complements ENS (names), EAS (attestations), World ID (human proof), and ERC-8004 (agent registry) — it does not replace them.

**DID format:** `did:bcid:human:{id}` · `did:bcid:company:{id}` · `did:bcid:asset:{id}` · `did:bcid:agent:{id}`

**Live today:** [app.buildingcultureid.space/bcid](https://app.buildingcultureid.space/bcid) · bridge from `.culture` · grant verifier at [/grant-proof](https://app.buildingcultureid.space/grant-proof)

---

## Problem

| Pain | Who feels it |
|------|--------------|
| Credentials are not portable across platforms | Builders, freelancers |
| Wallet address ≠ human-readable trust signal | All Web3 users |
| Sybil attacks undermine grants and DAO programs | Protocol operators |
| No standard for accountable AI agent identity | Agent developers |
| Reputation rewards followers, not shipped work | Builders |

---

## Solution — dynamic soulbound identity

The **identity anchor** is non-transferable (soulbound). **Reputation and credentials evolve** — Builder, Trust, Contribution, and Verification scores update as you ship; credentials can be issued or revoked.

| Layer | BCID approach |
|-------|---------------|
| **Identity** | Soulbound ERC-721 in `BcidRegistry` on Base |
| **Credentials** | Soulbound catalog + optional EAS attestations on Base |
| **Reputation** | Four verifiable scores (off-chain compute, on-chain anchors) |
| **Recovery** | 2-of-3 guardian timelock (72h delay) |
| **Privacy** | Encrypted credential storage; ZK selective disclosure (roadmap) |
| **Interop** | `.culture` bridge, ENS link, Farcaster FID, World ID, ERC-8004 agent card |

---

## Four BCID types

| Type | Namespace | Primary use |
|------|-----------|-------------|
| **Human** | `did:bcid:human:*` | Individual identity, credentials, reputation |
| **Company** | `did:bcid:company:*` | Org identity, delegated admins |
| **Asset** | `did:bcid:asset:*` | Tokenized property, certs, RWAs |
| **Agent** | `did:bcid:agent:*` | AI agent wallet, reputation, revenue split |

---

## Why not ENS / Farcaster / EAS alone?

- **ENS** — great namespace, transferable, no native reputation or credentials
- **Farcaster** — social graph, not portable credential wallet
- **EAS** — schema-agnostic attestations, no identity namespace or dynamic scores
- **World ID** — human uniqueness, not builder reputation
- **BCID** — soulbound DID + dynamic scores + credential catalog + agent-native ownership

See [competitor analysis](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/COMPETITOR_ANALYSIS.md) for the full matrix.

---

## Integrate BCID (DAOs & protocols)

**Free pilot package** for 3–5 DAOs:

1. BCID mint for core contributors (or bridge from `.culture`)
2. Credential types: `dao-member`, `grant-applicant`, `bcid-builder`
3. Public leaderboard at [/bcid/leaderboard](https://app.buildingcultureid.space/bcid/leaderboard)
4. Feedback shapes RFC v1.1 via [/voice](https://app.buildingcultureid.space/voice)

**APIs:** `GET /api/bcid/resolve` · `POST /api/bcid/bridge/culture` · `GET /api/bcid/catalog` · `GET /api/bcid/scores`

**Partnership brief:** [DAO_PARTNERSHIP_BRIEF.md](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/DAO_PARTNERSHIP_BRIEF.md)

**Contact:** hello@buildingcultureid.space · [Grant proof](https://app.buildingcultureid.space/grant-proof)

---

## Roadmap (v1)

| Phase | Deliverable |
|-------|-------------|
| **Now** | Human BCID mint, `.culture` bridge, 6+ credential types, leaderboard |
| **Month 1–2** | BCID Spec RFC public comment; EAS schema pack on Base Sepolia |
| **Month 2–3** | 100 Human BCIDs on Base mainnet; 3 DAO pilots |
| **Month 4+** | Company/Asset BCID; ZK selective disclosure; W3C DID method doc |

---

## Standards path

BCID does **not** claim to be the global standard on day one. Path: **public spec → RFC feedback → pilot DAOs → EAS schema registry → ecosystem co-publication**.

We cite and interoperate with EAS, ENS, World ID, and ERC-8004 in all external materials.

**Give feedback:** [/voice](https://app.buildingcultureid.space/voice) · GitHub Discussions · RFC comment deadline in [BCID_SPEC_RFC.md](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/BCID_SPEC_RFC.md)
