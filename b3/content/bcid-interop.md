# BCID interoperability

How Building Culture Identity works **alongside** ENS, `.culture`, EAS, World ID, and ERC-8004 — without breaking existing production systems.

---

## Principles

1. **No breaking changes** — `.culture` mint, credentials, and Culture Reputation stay live
2. **Opt-in bridge** — users choose when to mint Human BCID
3. **Credential portability** — earned credentials map 1:1 where categories align
4. **Complement, don't compete** — cite partner standards in all external docs
5. **Single wallet owner** — bridge requires the same EVM address owns both tokens

---

## Identity mapping

| Live (Culture ID) | BCID v1 equivalent |
|-------------------|-------------------|
| `.culture` NFT (transferable) | Human BCID (soulbound) — linked, not replaced |
| `CultureIdentity` Postgres row | `BcidIdentity` + `BcidBridgeLink` |
| `UserCredential` (6 types) | `BcidCredential` (extended catalog) |
| `computeCultureScore()` | `computeBcidReputation()` (4 scores) |
| `Member.farcasterFid` | `BcidLinkedAccount` platform=farcaster |

---

## ENS

- ENS name stored as linked account + optional resolver text record `bcid=<did>`
- BCID does **not** replace `.eth` — link for human-readable resolution
- Reverse resolution pattern for profile discovery

---

## EAS (Ethereum Attestation Service)

- BCID credentials map to EAS-compatible schemas on Base
- High-trust credentials can anchor `easAttestationUid` on `BcidCredential`
- Third-party issuers use published schema UIDs — see [EAS schema pack](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/EAS_SCHEMA_PACK.md)
- EAS handles attestations; BCID handles identity namespace + dynamic reputation

---

## World ID / Gitcoin Passport

- Optional linked proof for sybil resistance — not required for mint
- Verification Score incorporates human-proof signals at configurable weight
- No Orb or stamp data stored on-chain in v1

---

## ERC-8004 (agent registry)

- Agent BCID binds wallet + reputation + revenue split
- Agent card links `did:bcid:agent:*` for discoverability
- BUILDCHAIN Agent ID on 0G Chain interoperates via agent-card metadata

---

## Bridge flow (`.culture` → BCID)

```
User → POST /api/bcid/bridge/culture (SIWE)
     → Verify wallet owns cultureTokenId
     → Mint Human BCID (or link existing)
     → Copy eligible UserCredentials → BcidCredential
     → Seed Contribution Score from Culture history
```

**Response example:**

```json
{
  "ok": true,
  "did": "did:bcid:human:abc123",
  "cultureHandle": "alice.culture",
  "credentialsMigrated": 3,
  "contributionScoreSeed": 12.5
}
```

---

## Credential mapping

| Culture credential | BCID credential | Auto-migrate |
|--------------------|-----------------|--------------|
| `builder` | `bcid-builder` | Yes |
| `contributor` | `bcid-contributor` | Yes |
| `community-leader` | `bcid-community-leader` | Yes |
| `verified-human` | `bcid-verified-human` | Yes |
| `verified-project` | `bcid-verified-project` | Yes |

---

## Dual-identity period

During the parallel rollout, Culture Reputation events feed BCID scores at reduced weight:

| Culture dimension | BCID score | Weight |
|-------------------|------------|--------|
| Credentials | Trust Score | 0.5× |
| Contributions | Contribution Score | 0.5× |
| Social trust | Excluded | 0× |
| Human verification | Verification Score | 1.0× |

---

## APIs

| Endpoint | Purpose |
|----------|---------|
| `GET /api/bcid/resolve?did=` | Resolve DID to public profile |
| `GET /api/bcid/by-culture?handle=` | Lookup BCID by `.culture` handle |
| `POST /api/bcid/bridge/culture` | Bridge `.culture` → Human BCID |
| `GET /api/bcid/catalog` | Credential type catalog |
| `GET /api/bcid/scores?did=` | Reputation scores |

---

## For DAO integrators

Use BCID as **applicant identity** in grant forms and Snapshot/Guild gates:

1. Require `did:bcid:human:*` or `bcid-builder` credential
2. Verify via `/api/bcid/resolve` — no custom indexer required for v1
3. Issue `dao-member` credential back to contributors (pilot)

**Partnership:** hello@buildingcultureid.space · [DAO brief](https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/DAO_PARTNERSHIP_BRIEF.md)
