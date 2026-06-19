# BCID Specification v1 — Request for Comments

**RFC status:** Open for public comment  
**Comment deadline:** 2026-08-18 (60 days from publication)  
**Canonical repo:** `docs/protocol/BCID_SPEC_RFC.md`

---

## Summary

This RFC proposes **BCID v1** — a soulbound decentralized identifier method (`did:bcid`) with dynamic reputation, soulbound credentials, guardian recovery, and explicit interoperability with ENS, EAS, World ID, ERC-8004, and the live `.culture` ERC-721 trust layer.

**Reference implementation:** [app.buildingcultureid.space/bcid](https://app.buildingcultureid.space/bcid)  
**Lite paper:** [BCID_LITE_PAPER.md](./BCID_LITE_PAPER.md)

---

## 1. DID method: `did:bcid`

### 1.1 Method name

`bcid` — Building Culture Identity

### 1.2 DID syntax

```
did:bcid:<type>:<id>
```

| Component | Values |
|-----------|--------|
| `type` | `human` \| `company` \| `asset` \| `agent` |
| `id` | Lowercase alphanumeric + hyphen, 8–64 chars (cuid/uuid derived) |

**Examples:**
- `did:bcid:human:clxyz123abc`
- `did:bcid:agent:clagent456def`

### 1.3 DID document (resolved via API v1)

```json
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:bcid:human:clxyz123abc",
  "verificationMethod": [{
    "id": "did:bcid:human:clxyz123abc#owner",
    "type": "EcdsaSecp256k1VerificationKey2019",
    "controller": "did:bcid:human:clxyz123abc",
    "blockchainAccountId": "eip155:8453:0x..."
  }],
  "service": [{
    "id": "did:bcid:human:clxyz123abc#resolve",
    "type": "BCIDResolve",
    "serviceEndpoint": "https://app.buildingcultureid.space/api/bcid/resolve?did=did:bcid:human:clxyz123abc"
  }]
}
```

Resolution today is HTTP API-based. On-chain `tokenURI` hash anchors metadata commitment.

---

## 2. On-chain anchor

### 2.1 Registry contract

`BcidRegistry` — soulbound ERC-721 on Base (Sepolia testnet, mainnet production).

| Field | Storage |
|-------|---------|
| `tokenId` | uint256 |
| `owner` | address (non-transferable except recovery) |
| `type` | enum Human/Company/Asset/Agent |
| `metadataUri` | string (IPFS CID or HTTPS) |
| `mintedAt` | block timestamp |

### 2.2 Soulbound semantics

Transfers revert except:
- Mint to owner
- Burn (explicit user action, future)
- Recovery module owner rotation after guardian timelock

ERC-5192 minimal soulbound interface considered for v1.1.

---

## 3. Metadata JSON schema (Human v1)

```json
{
  "$schema": "https://buildingcultureid.space/schemas/bcid-human-v1.json",
  "version": "1.0",
  "type": "human",
  "displayName": "string (1-64)",
  "publicHandle": "string (3-32, [a-z0-9-])",
  "createdAt": "ISO8601",
  "recoveryGuardians": ["0x..."],
  "linkedAccounts": {
    "farcaster": { "fid": 123, "verified": true },
    "ens": { "name": "alice.eth", "verified": true },
    "cultureId": { "handle": "alice.culture", "tokenId": "42" },
    "worldId": { "nullifierHash": "0x...", "verified": true }
  },
  "publicProfile": {
    "bio": "string (0-280)",
    "avatarUri": "ipfs://...",
    "website": "https://..."
  },
  "encryptedProfileRef": "ipfs://..."
}
```

---

## 4. Credential types (v1 catalog)

| Slug | Issuer | Soulbound | EAS schema |
|------|--------|-----------|------------|
| `bcid-builder` | BC app / DAO pilot | Optional on-chain | `bcid-builder-v1` |
| `bcid-contributor` | BC app | Postgres | `bcid-contributor-v1` |
| `bcid-community-leader` | BC admin | Postgres | `bcid-community-leader-v1` |
| `bcid-verified-human` | BC app + Web3.bio | Optional EAS | `bcid-verified-human-v1` |
| `bcid-verified-project` | BC admin | Postgres | `bcid-verified-project-v1` |
| `dao-member` | DAO pilot issuer | EAS | `bcid-dao-member-v1` |
| `grant-applicant` | Grant program | EAS | `bcid-grant-applicant-v1` |

Credential record:

```json
{
  "slug": "bcid-builder",
  "status": "active",
  "issuedAt": "ISO8601",
  "expiresAt": null,
  "evidence": {},
  "easAttestationUid": "0x... optional"
}
```

---

## 5. Reputation formula (v1)

Four scores ∈ [0, 100], recomputed on `BcidReputationEvent` append.

### 5.1 Builder Score

```
builder = min(100, Σ(event.weight × event.delta) + credential_bonus)
```

Sources: quest completion, shipped attestations, `bcid-builder` credential (+10 cap).

### 5.2 Trust Score

```
trust = min(100, tenure_days × 0.1 + guardian_bonus + Σ(trust_events))
```

`guardian_bonus` = 5 if ≥2 guardians configured.

### 5.3 Contribution Score

```
contribution = min(100, bridge_seed + Σ(contribution_events))
```

Dual-period Culture feed-forward at 0.5× weight — see [INTEROP_CULTURE_ID.md](./INTEROP_CULTURE_ID.md).

### 5.4 Verification Score

```
verification = min(100, human_proof_weight + siwe_tenure_weight)
```

**Explicit exclusion:** follower count, Neynar social score, cast frequency.

---

## 6. Interoperability (normative)

### 6.1 `.culture` bridge

`POST /api/bcid/bridge/culture` — SIWE required. See [INTEROP_CULTURE_ID.md](./INTEROP_CULTURE_ID.md).

### 6.2 EAS

Third-party issuers MUST use published schema UIDs from [EAS_SCHEMA_PACK.md](./EAS_SCHEMA_PACK.md). Attestation `recipient` SHOULD be applicant wallet; `data` SHOULD include `bcidDid` string.

### 6.3 ENS

Linked ENS name SHOULD set text record `bcid=<did>` when user opts in.

### 6.4 ERC-8004

Agent BCID `did:bcid:agent:*` SHOULD appear in agent-card `metadata.bcidDid` field.

---

## 7. Recovery (v1)

- 2-of-3 guardian signatures
- 72-hour timelock on `BcidRecoveryModule`
- New owner wallet set on registry; linked accounts require SIWE re-verification

---

## 8. Security considerations

- Issuer key compromise → credential revocation + EAS revocation
- Sybil multi-wallet → optional World ID weighting; no silver bullet
- Guardian collusion → timelock + email notification (future)
- PII → encrypted off-chain only in v1

Full analysis: [THREAT_MODEL.md](../security/THREAT_MODEL.md), [PRIVACY_MODEL.md](../security/PRIVACY_MODEL.md).

---

## 9. Reference implementation

| Artifact | URL / path |
|----------|------------|
| App | https://app.buildingcultureid.space/bcid |
| Contracts | `contracts/src/bcid/BcidRegistry.sol` |
| APIs | `/api/bcid/*` |
| Grant verifier | https://app.buildingcultureid.space/grant-proof |

---

## 10. How to comment

| Channel | Action |
|---------|--------|
| **Builder Voice** | https://app.buildingcultureid.space/voice — tag feedback `bcid-rfc` |
| **GitHub** | Open Discussion on xrpbaby repo |
| **EAS forum** | Reply to schema proposal thread (see EAS_SCHEMA_PACK.md) |
| **Base Discord** | `#show-your-work` — link grant-proof + RFC |
| **Email** | hello@buildingcultureid.space |

Comments on: DID syntax, reputation weights, credential catalog, EAS schema fields, recovery parameters.

---

## 11. RFC timeline

| Date | Milestone |
|------|-----------|
| 2026-06-18 | RFC published |
| 2026-07-18 | Draft v1.0.1 — incorporate pilot DAO feedback |
| 2026-08-18 | Comment period closes |
| 2026-09-01 | Spec v1.0 frozen; EAS mainnet schemas |

---

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0-draft | 2026-06-18 | Initial RFC publication |

---

*RFC — not a formal EIP or W3C submission yet. W3C DID Method document to follow if traction warrants.*
