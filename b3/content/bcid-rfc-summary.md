# BCID Specification v1 — RFC Summary

**Status:** Open for public comment until **2026-08-18**

This page summarizes the full RFC. Canonical spec: [BCID_SPEC_RFC.md on GitHub](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/BCID_SPEC_RFC.md)

---

## DID method: `did:bcid`

```
did:bcid:<type>:<id>
```

Types: `human` · `company` · `asset` · `agent`

**Resolve:** `GET /api/bcid/resolve?did=did:bcid:human:...`

---

## Dynamic soulbound model

| Layer | Behavior |
|-------|----------|
| Identity anchor | Non-transferable ERC-721 in `BcidRegistry` |
| Credentials | Issued/revoked over time; optional EAS UID |
| Reputation | Four scores recompute from verifiable events |

---

## Credential catalog (v1)

| Slug | Use |
|------|-----|
| `bcid-builder` | Shipped work proof |
| `bcid-contributor` | Community contribution |
| `bcid-verified-human` | Human proof |
| `dao-member` | DAO pilot membership |
| `grant-applicant` | Grant program binding |

EAS schemas: [EAS_SCHEMA_PACK.md](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/EAS_SCHEMA_PACK.md)

---

## Reputation formula

Four scores ∈ [0, 100]:

- **Builder** — quests, credentials, attestations
- **Trust** — tenure, guardians, credential holdings
- **Contribution** — community tasks, bridge seed
- **Verification** — human proof, SIWE history

**Excluded:** follower count, Neynar social score, cast frequency.

---

## Interoperability (normative)

- `.culture` bridge via `POST /api/bcid/bridge/culture`
- EAS attestations with published schema UIDs
- ENS text record `bcid=<did>` (optional)
- ERC-8004 agent-card `metadata.bcidDid`

---

## How to comment

| Channel | Link |
|---------|------|
| Builder Voice | [/voice](https://app.buildingcultureid.space/voice) — tag `bcid-rfc` |
| Email | hello@buildingcultureid.space |
| GitHub | Discussions on xrpbaby repo |
| EAS forum | Schema proposal thread |

---

## Timeline

| Date | Milestone |
|------|-----------|
| 2026-06-18 | RFC published |
| 2026-07-18 | Draft v1.0.1 from pilot feedback |
| 2026-08-18 | Comment period closes |
| 2026-09-01 | Spec v1.0 frozen |

**Lite paper:** [BCID_LITE_PAPER.md](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/BCID_LITE_PAPER.md)
