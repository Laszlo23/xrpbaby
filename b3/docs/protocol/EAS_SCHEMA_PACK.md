# BCID EAS Schema Pack

**Ethereum Attestation Service schemas for BCID credentials on Base**

Version 1.0-draft · Target chain: Base (8453) · Testnet: Base Sepolia (84532)

---

## Overview

BCID credentials can anchor to EAS attestations for third-party verifiability. The BCID app stores `easAttestationUid` on `BcidCredential` when an attestation is linked.

**EAS Base contracts:**
- Schema Registry: `0x4200000000000000000000000000000000000021`
- EAS Contract: `0x4200000000000000000000000000000000000020`

(Verify current addresses on [Base docs](https://docs.base.org) before mainnet deploy.)

---

## Schema format

All BCID schemas use:

```
schema = "bytes32 bcidDid,string credentialSlug,uint64 issuedAt,bytes32 evidenceHash"
```

| Field | Type | Description |
|-------|------|-------------|
| `bcidDid` | bytes32 | keccak256(`did:bcid:human:...`) truncated encoding |
| `credentialSlug` | string | e.g. `bcid-builder`, `dao-member` |
| `issuedAt` | uint64 | Unix timestamp |
| `evidenceHash` | bytes32 | keccak256 of evidence JSON |

**Revocable:** Yes (issuer can revoke)  
**Resolver:** None (data self-contained)

---

## Schema definitions

### 1. `bcid-builder-v1`

**Purpose:** Issued to builders who shipped verifiable work.

| Field | Value |
|-------|-------|
| Schema UID (Sepolia) | `0x0000000000000000000000000000000000000000000000000000000000bcid01` *(deploy pending)* |
| Issuer | Building Culture + pilot DAOs |
| Recipient | Applicant wallet address |

**Eligibility:** Quest completion, repo proof, or DAO admin approval.

---

### 2. `bcid-contributor-v1`

**Purpose:** Community contribution credential.

| Field | Value |
|-------|-------|
| Schema UID (Sepolia) | `0x0000000000000000000000000000000000000000000000000000000000bcid02` |
| Issuer | Building Culture app |

---

### 3. `bcid-community-leader-v1`

**Purpose:** Moderation / leadership role.

| Field | Value |
|-------|-------|
| Schema UID (Sepolia) | `0x0000000000000000000000000000000000000000000000000000000000bcid03` |
| Issuer | BC admin only |

---

### 4. `bcid-verified-human-v1`

**Purpose:** Human proof via Web3.bio / World ID / Coinbase verification.

| Field | Value |
|-------|-------|
| Schema UID (Sepolia) | `0x0000000000000000000000000000000000000000000000000000000000bcid04` |
| Issuer | Building Culture app |

---

### 5. `bcid-dao-member-v1`

**Purpose:** DAO pilot — member of participating organization.

| Field | Value |
|-------|-------|
| Schema UID (Sepolia) | `0x0000000000000000000000000000000000000000000000000000000000bcid05` |
| Issuer | Pilot DAO wallet (co-issuer) |

**Extra field (v1.1):** `daoId` string in evidence JSON.

---

### 6. `bcid-grant-applicant-v1`

**Purpose:** Grant program applicant identity binding.

| Field | Value |
|-------|-------|
| Schema UID (Sepolia) | `0x0000000000000000000000000000000000000000000000000000000000bcid06` |
| Issuer | Grant program operator |

---

## Deploy script

```bash
# From repo root (requires EAS SDK + deployer wallet on Base Sepolia)
node scripts/deploy-bcid-eas-schemas.mjs --chain sepolia
```

Schema UIDs are written to `docs/protocol/EAS_SCHEMA_UIDS.json` after deploy.

---

## App integration

TypeScript constants: `app/src/lib/bcid/eas-schemas.ts`

Sync flow:
1. Issuer creates EAS attestation with BCID schema
2. Applicant calls `POST /api/bcid/credentials/claim` with `easAttestationUid`
3. App verifies attestation on-chain → upserts `BcidCredential`

---

## Forum posts (copy-paste)

### EAS Forum

```
Title: Schema proposal — BC builder credentials (bcid-builder-v1)

We're proposing 6 EAS schemas for Building Culture Identity (BCID) credentials on Base.
BCID is a soulbound DID that complements EAS — attestations anchor portable builder reputation.

Schemas: bcid-builder, bcid-contributor, bcid-verified-human, dao-member, grant-applicant
Spec: https://app.buildingcultureid.space/docs/rfc
Schema pack: https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/EAS_SCHEMA_PACK.md
Grant proof: https://app.buildingcultureid.space/grant-proof

Feedback welcome — RFC open until 2026-08-18.
```

### Base Discord `#show-your-work`

```
Shipped: BCID soulbound identity + EAS schema pack proposal on Base

- Live mint + .culture bridge: /bcid
- 6 credential schemas for DAO/grant issuers
- Public RFC + grant verifier (36+ checks)

Verify: https://app.buildingcultureid.space/grant-proof
Docs: https://app.buildingcultureid.space/docs/bcid
```

---

## References

- [BCID_SPEC_RFC.md](./BCID_SPEC_RFC.md)
- [EAS Documentation](https://docs.attest.org/)
- [attest.sh Schema Builder](https://attest.sh/)

*Schema UIDs marked "deploy pending" are placeholders until `deploy-bcid-eas-schemas.mjs` runs on testnet.*
