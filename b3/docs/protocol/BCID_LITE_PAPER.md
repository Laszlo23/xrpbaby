# BCID Lite Paper

**Building Culture Identity — a complementary soulbound identity standard**

Version 1.0-draft · June 2026  
Authors: Building Culture protocol team  
Status: Public comment open — see [BCID_SPEC_RFC.md](./BCID_SPEC_RFC.md)

---

## Abstract

Building Culture Identity (BCID) is a soulbound, portable decentralized identifier for builders, organizations, tokenized assets, and AI agents. Unlike transferable namespace systems (ENS, `.culture`) or schema-agnostic attestation layers (EAS), BCID combines a **non-transferable identity anchor** with **dynamic reputation scores** and a **credential catalog** that can interoperate with EAS, World ID, and ERC-8004. This paper describes the problem, identity model, interoperability posture, security properties, and roadmap for BCID v1.

---

## 1. Introduction

Web3 identity today is fragmented. Wallet addresses are opaque. ENS names are transferable and reputation-free. Farcaster FIDs are platform-bound. EAS provides attestations without a canonical identity namespace. World ID proves humanity but not professional contribution. ERC-8004 addresses agent discoverability but not human-agent ownership graphs.

BCID fills the gap: a **soulbound DID** (`did:bcid:*`) with four reputation dimensions, soulbound credentials, guardian recovery, and explicit bridges to live Building Culture infrastructure — including the production `.culture` ERC-721 trust layer on Base mainnet.

**Positioning:** BCID complements ENS, EAS, World ID, and ERC-8004. It does not claim to be the sole global standard.

---

## 2. Problem statement

### 2.1 Builder identity is not portable

Professional credentials live in silos (GitHub, LinkedIn, grant dashboards). Web3 grants and DAO programs cannot cheaply verify that an applicant has shipped work versus farming social metrics.

### 2.2 Sybil cost is high for ecosystem programs

Retroactive funding, airdrops, and community rewards attract duplicate identities. Human-proof layers exist but are not integrated with builder reputation.

### 2.3 Agent accountability is undefined

AI agents operate wallets without a standard binding to a human or company owner, reputation history, or revenue attribution.

### 2.4 Static soulbound badges miss evolving reputation

Early SBT implementations issue non-transferable tokens that do not update. BCID separates the **immutable identity anchor** from **mutable credentials and scores**.

---

## 3. Identity model

### 3.1 Four BCID types

| Type | DID namespace | Soulbound | Launch |
|------|---------------|-----------|--------|
| Human | `did:bcid:human:{uuid}` | Yes | v1 (live) |
| Company | `did:bcid:company:{uuid}` | Yes | Month 4 |
| Asset | `did:bcid:asset:{uuid}` | Yes | Month 5 |
| Agent | `did:bcid:agent:{uuid}` | Yes | Month 3 |

### 3.2 Dynamic soulbound

- **Anchor:** ERC-721 soulbound token in `BcidRegistry` — non-transferable, one per wallet per type (Human v1).
- **Credentials:** Issued/revoked over time; high-trust credentials may anchor EAS attestation UIDs.
- **Reputation:** Four scores recomputed from verifiable events — Builder, Trust, Contribution, Verification. No follower weight.

### 3.3 Human BCID metadata (v1)

Public fields: `displayName`, `publicHandle`, `linkedAccounts` (Farcaster, ENS, `.culture`), `recoveryGuardians` (hashed on-chain). Private fields: encrypted PII bucket referenced by `encryptedProfileRef` (IPFS/4EVERLAND).

### 3.4 Issuance

Human BCID mint requires SIWE-authenticated wallet, unique handle (3–32 chars), and mint fee (ETH or BCC). Optional `.culture` bridge copies eligible credentials and seeds Contribution Score.

---

## 4. Interoperability

BCID is designed as a **parallel standard** alongside live `.culture` production:

| Partner | BCID relationship |
|---------|-------------------|
| **ENS** | Linked account; optional `bcid=<did>` text record |
| **`.culture`** | Opt-in bridge via `POST /api/bcid/bridge/culture` |
| **EAS** | Credential schemas on Base; `easAttestationUid` on `BcidCredential` |
| **World ID** | Optional Verification Score input |
| **ERC-8004** | Agent BCID + agent card metadata |
| **Farcaster** | FID as linked account; Frame mint CTA |

Full bridge rules: [INTEROP_CULTURE_ID.md](./INTEROP_CULTURE_ID.md).

---

## 5. Reputation engine

### 5.1 Four scores

| Score | Sources (examples) |
|-------|-------------------|
| Builder | Shipped quests, credentials, on-chain attestations |
| Trust | Credential holdings, guardian setup, tenure |
| Contribution | Community tasks, bridge seed, DAO participation |
| Verification | Human proof stamps, SIWE history, optional KYC |

### 5.2 Dual-identity period

During Months 2–4, Culture Reputation events feed BCID scores at 0.5× weight (social trust excluded). This enables gradual migration without breaking `.culture` holders.

### 5.3 Leaderboard

Public snapshots at `/bcid/leaderboard` — Builder Score ranked; no vanity social metrics.

---

## 6. Security and privacy

### 6.1 Trust boundaries

| Zone | Contents | Exposure |
|------|----------|----------|
| On-chain | Token ID, owner, credential token IDs | Public |
| Postgres | Events, scores, linked accounts | App-trusted |
| Encrypted storage | PII, KYB docs | User-key encrypted |
| ZK proofs | Claim statements only | Zero-knowledge (Month 6+) |

### 6.2 Recovery

2-of-3 guardian approvals with 72-hour timelock before owner wallet rotation on `BcidRecoveryModule`.

### 6.3 Threat model

Sybil via multi-wallet, credential forgery, guardian collusion, and issuer compromise are addressed in [THREAT_MODEL.md](../security/THREAT_MODEL.md). BCID does not store raw KYC on-chain in v1.

---

## 7. Reference implementation

| Component | Location |
|-----------|----------|
| Smart contracts | `contracts/src/bcid/BcidRegistry.sol` |
| App APIs | `/api/bcid/*` on app.buildingcultureid.space |
| Database | `BcidIdentity`, `BcidCredential`, `BcidReputationScore` in Prisma |
| Grant verifier | `/grant-proof` — 36+ automated production checks |
| Live mint | `/bcid/mint` |

**Verify shipped work:** [app.buildingcultureid.space/grant-proof](https://app.buildingcultureid.space/grant-proof)

---

## 8. Standards path

1. Publish this lite paper + [BCID_SPEC_RFC.md](./BCID_SPEC_RFC.md)
2. Open public comment (GitHub Discussions + `/voice` feedback)
3. Close 3 DAO pilot integrations with co-published EAS schemas
4. Register EAS schemas on Base Sepolia → mainnet
5. Optional W3C DID Method document for `did:bcid`

BCID will **not** cold-mass-email DAOs or claim sole-standard status. Outreach is human-approved agent drafts only.

---

## 9. Roadmap

| Milestone | Target |
|-----------|--------|
| Human BCID mint + bridge | Live |
| BCID Spec RFC public comment | Month 1 |
| EAS schema pack (6 credentials) | Month 1–2 |
| 100 Human BCIDs on Base mainnet | Month 3 |
| 3 DAO pilots | Month 3 |
| Company + Agent BCID | Month 4 |
| ZK selective disclosure | Month 6 |

---

## 10. Conclusion

BCID offers ecosystem programs a **portable applicant identity** with **verifiable credentials** and **dynamic reputation** — reducing sybil cost for grants and DAO governance while interoperating with established standards. We invite protocol operators, DAO tooling teams, and identity researchers to pilot integration and comment on the RFC.

**Contact:** hello@buildingcultureid.space  
**Feedback:** [app.buildingcultureid.space/voice](https://app.buildingcultureid.space/voice)  
**Grant proof:** [app.buildingcultureid.space/grant-proof](https://app.buildingcultureid.space/grant-proof)

---

## References

- [BCID_V1_PRD.md](./BCID_V1_PRD.md)
- [COMPETITOR_ANALYSIS.md](./COMPETITOR_ANALYSIS.md)
- [INTEROP_CULTURE_ID.md](./INTEROP_CULTURE_ID.md)
- [IDENTITY_ARCHITECTURE.md](../architecture/IDENTITY_ARCHITECTURE.md)
- [EAS_SCHEMA_PACK.md](./EAS_SCHEMA_PACK.md)
- [Ethereum Attestation Service](https://attest.org/)
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)

*This document is technical protocol material — not legal or investment advice.*
