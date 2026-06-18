# BCID Threat Model

Identity theft, sybil attacks, credential forgery, and recovery abuse.

---

## Assets

| Asset | Sensitivity | Location |
|-------|-------------|----------|
| BCID ownership | Critical | Onchain |
| Encryption keys | Critical | Client only |
| Credential evidence | High | Encrypted storage |
| Reputation scores | Medium | Postgres |
| Guardian addresses | High | Onchain |
| PII blobs | Critical | Encrypted storage |

---

## Threat actors

| Actor | Goal | Capability |
|-------|------|------------|
| Identity thief | Take over BCID | Phishing, SIM swap |
| Sybil farmer | Multiple Human BCIDs | Bots, fake KYC |
| Credential forger | Fake builder creds | API abuse, DB access |
| Guardian colluder | Recovery to attacker wallet | 2-of-3 compromise |
| Insider | Mass data exfil | DB/admin access |

---

## Threat matrix

| ID | Threat | Impact | Likelihood | Mitigation |
|----|--------|--------|------------|------------|
| T1 | Wallet phishing → BCID takeover | Critical | Medium | SIWE + guardian recovery; user education |
| T2 | Sybil Human BCID mints | High | High | World ID nullifier; video verify Tier 3 |
| T3 | Fake credential via API | High | Low | SIWE owner check; issuer role onchain |
| T4 | Guardian griefing (spam recovery) | Medium | Medium | 0.01 ETH fee; 72h timelock |
| T5 | Encrypted blob key loss | High | Medium | Recovery re-derives from new wallet signature post-recovery |
| T6 | Postgres credential tampering | High | Low | Onchain hash anchor for high-trust creds |
| T7 | Replay of ZK proof | Medium | Low | Nullifier registry onchain |
| T8 | Bridge double-link (.culture) | Medium | Low | Unique constraint on `BcidBridgeLink.cultureHandle` |
| T9 | Referral farming | Low | High | Referred user must mint BCID; cap 5 referrals |
| T10 | Admin key compromise | Critical | Low | Safe multisig; no hot-EOA issuer |

---

## Identity theft scenarios

### Scenario A: Seed phrase compromise
**Before recovery:** Attacker controls BCID  
**Mitigation:** User initiates recovery with pre-set guardians → timelock → new owner  
**Gap:** If guardians also compromised → total loss (same as wallet)

### Scenario B: SIWE session hijack
**Mitigation:** Short session TTL; HttpOnly cookies; CSRF on POST endpoints

### Scenario C: Culture ID bridge hijack
**Mitigation:** Bridge requires SIWE wallet == `CultureLayerIdentity.ownerOf(tokenId)`

---

## Sybil resistance layers

| Layer | Mechanism | When |
|-------|-----------|------|
| L1 | Wallet uniqueness | Mint |
| L2 | Web3.bio isHuman | Credential claim |
| L3 | World ID nullifier | Month 6 |
| L4 | Video liveness | Month 6 |
| L5 | KYC (optional) | High-value flows |

---

## Credential forgery

| Vector | Control |
|--------|---------|
| Direct DB insert | Prisma only via server; no raw SQL in app |
| Fake API claim | SIWE + eligibility engine + `proofRef` required |
| Onchain fake cred | `ISSUER_ROLE` on `BcidSoulboundCredential` |

---

## Monitoring

| Signal | Alert |
|--------|-------|
| >10 recovery initiations/hour | Pager |
| Credential claim without eligibility | Log + rate limit |
| Same nullifier twice | Block + alert |
| Bridge from non-owner wallet | 403 + log |

See [../OBSERVABILITY.md](../OBSERVABILITY.md) for ops integration.
