# BCID Privacy Model

Data minimization, selective disclosure, and user control.

---

## Principles

1. **Collect minimum** — public profile vs encrypted PII bucket separation
2. **User holds keys** — encryption derived from wallet signature; app never stores raw keys
3. **Prove without revealing** — ZK proofs for age, human, ownership, KYC tier
4. **No surveillance scoring** — reputation from verifiable actions, not behavioral tracking
5. **Deletion on request** — encrypted blobs deletable; onchain tokens immutable (revocation only)

---

## Data classification

| Class | Examples | Storage | Access |
|-------|----------|---------|--------|
| **Public** | handle, displayName, scores, credential slugs | Postgres + IPFS | Anyone |
| **Pseudonymous** | wallet address, onchain token ID | Onchain | Anyone |
| **Protected** | email, DOB, KYC docs, legal name | Encrypted blob | Owner + ZK proof |
| **Internal** | eligibility rules, fraud flags | Postgres | App only |

---

## What we never store in plaintext

- Date of birth
- Government ID numbers
- Full KYC document contents
- Private messages
- Biometric data (World ID nullifier only)

---

## Selective disclosure

| User wants to prove | Mechanism | Verifier sees |
|---------------------|-----------|---------------|
| Age ≥ 18 | ZK Age Proof | true/false + nullifier |
| Is unique human | World ID nullifier | true/false |
| Holds builder credential | Onchain credential token | token ID + schema |
| Accredited investor | ZK KYC Proof | tier boolean |
| Owns asset X | Ownership proof | commitment match |

---

## Third-party data flows

| Provider | Data sent | Purpose | Retention |
|----------|-----------|---------|-----------|
| World ID | Nullifier only | Human proof | Onchain permanent |
| Web3.bio | Wallet address | isHuman check | Cache 24h |
| Neynar | FID (if linked) | Farcaster verify | Member record |
| 4EVERLAND | Encrypted blob | Storage | Until deletion |
| PostHog | Anonymized events | Analytics | 90 days |

---

## User rights

| Right | Implementation |
|-------|----------------|
| Access | Export API: `/api/bcid/me/export` (Month 5) |
| Rectification | Update public metadata via SIWE |
| Erasure | Delete encrypted blobs; revoke credentials; BCID token immutable |
| Portability | DID + credential export JSON |

---

## Rejected patterns (from competitor analysis)

| Pattern | Source | BCID stance |
|---------|--------|-------------|
| Public stamp collection | Gitcoin Passport | Reject — opaque aggregate |
| Follower-based score | Farcaster/Lens | Reject — vanity metric |
| Full profile NFT public | Lens | Reject — encrypted default |
| Orb biometric storage | World ID | Accept nullifier only, not biometrics |

---

## Privacy review checklist (Month 1)

- [x] Data classification table
- [x] Selective disclosure map
- [x] Third-party flow inventory
- [ ] DPIA for EU users (Month 3 legal review)
- [ ] Privacy policy update for BCID (Month 3)
