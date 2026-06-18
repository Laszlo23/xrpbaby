# BCID v1 Competitor Analysis

Structured comparison of seven identity/reputation systems. BCID v1 adopts proven patterns and explicitly rejects anti-patterns (vanity social scoring, non-portable silos, surveillance-by-default).

---

## Summary matrix

| Dimension | Farcaster | ENS | World ID | EAS | Gitcoin Passport | zkSync | Lens | **BCID v1** |
|-----------|-----------|-----|----------|-----|------------------|--------|------|-------------|
| **Primary anchor** | FID + custody | `.eth` name | Orb proof | Attestation UID | Stamp collection | L2 + ZK | Profile NFT | Soulbound BCID |
| **Portability** | Low (Hub lock-in) | High (onchain) | Medium (World App) | High (schema-agnostic) | Medium (stamp deps) | High (L2) | Low (Lens chain) | High (multi-chain refs) |
| **Human proof** | Phone/email signup | None native | Orb biometric | Issuer-defined | Stamp providers | ZK identity | None native | World ID + video + optional KYC |
| **Reputation** | Neynar score, social graph | None native | None | Attestation graph | Gitcoin score | None | Follower graph | 4 verifiable scores |
| **Recovery** | Custody recovery | Social recovery (limited) | World ID re-verify | Revocation only | Re-stamp | Account abstraction | Wallet-only | Guardian + timelock |
| **Privacy** | Public casts | Public resolver | ZK proofs | Selective disclosure | Public stamps | ZK-native | Public profile | Encrypted creds + ZK proofs |
| **Agent identity** | Farcaster bots | None | None | Possible via EAS | None | AA wallets | None | Agent BCID + ERC-8004 |
| **Monetization** | Warps, channels | Registration fees | None | Gas only | None | Gas + sequencer | Collect fees | BCC mint + cred fees |

---

## 1. Farcaster

### What it does well
- Low-friction social onboarding (phone → FID)
- Rich social graph for discovery
- Frames for in-feed actions
- Neynar API for verified links

### Weaknesses for BCID use case
- Identity is platform-bound (FID ≠ portable credential wallet)
- Reputation = social graph metrics (followers, casts) — not verifiable work
- No native credential/attestation layer
- Custody model limits self-sovereignty

### BCID decision
| Adopt | Reject |
|-------|--------|
| FID as **linked account** (not primary BCID) | FID as identity anchor |
| Farcaster Frame for BCID mint CTA | Follower count in reputation |
| Cast-attestation for credential claims | Warps as payment rail |

**Interop:** `Member.farcasterFid` links to Human BCID; Month 3 Farcaster Frame at `/api/bcid/farcaster/frame`.

---

## 2. ENS

### What it does well
- Canonical onchain namespace (`.eth`)
- CCIP-read resolution
- Text records for metadata
- Established wallet UX

### Weaknesses
- Names are **transferable** (identity squatting, sale)
- No built-in credentials or reputation
- Recovery limited (no standard guardian model in core)
- Expensive on L1; L2 variants fragmented

### BCID decision
| Adopt | Reject |
|-------|--------|
| Namespace resolution pattern | Transferable identity NFT as BCID |
| Text record schema for public metadata | ENS as sole identity |
| Reverse resolution for profiles | Annual renewal friction for core ID |

**Interop:** ENS name stored as `LinkedWallet` + resolver text record `bcid=<did>`.

---

## 3. World ID

### What it does well
- Strong sybil resistance (Orb)
- Zero-knowledge human proof (Semaphore-derived)
- Privacy-preserving uniqueness

### Weaknesses
- Hardware dependency (Orb availability)
- Regulatory scrutiny in some jurisdictions
- No builder/project/asset identity types
- Limited credential extensibility

### BCID decision
| Adopt | Reject |
|-------|--------|
| World ID as **Verification Score** input | Orb as only human proof path |
| ZK human uniqueness proof | Centralized World ID as sole gate |
| Optional high-trust tier | Mandatory Orb for basic BCID |

**Proof type:** Human Proof via World ID → `verification_score` + Verified Human credential.

---

## 4. Ethereum Attestation Service (EAS)

### What it does well
- Schema-flexible attestations
- Onchain + offchain storage options
- Revocation and expiration
- Composable trust graph

### Weaknesses
- No identity namespace (attestations need external anchor)
- UX complexity for non-crypto users
- Gas costs on L1; L2 adoption growing

### BCID decision
| Adopt | Reject |
|-------|--------|
| EAS schemas for credential attestations | EAS UID as primary BCID |
| Onchain anchor for high-trust credentials | All credentials onchain (cost) |
| Revocation registry | Custom attestation silo |

**Schema examples:** `BCIDBuilderCredential`, `BCIDVerificationProof` — see [SMART_CONTRACTS.md](../architecture/SMART_CONTRACTS.md).

---

## 5. Gitcoin Passport

### What it does well
- Aggregates trust from multiple providers ("stamps")
- Familiar Web3 onboarding pattern
- Passport score for gating

### Weaknesses
- Score is opaque aggregate (hard to audit)
- Stamp providers change; dependency risk
- Social/platform stamps ≠ verifiable contributions
- No recovery or agent identity

### BCID decision
| Adopt | Reject |
|-------|--------|
| Multi-provider verification **concept** | Gitcoin score formula |
| Stamp-like external attestations as inputs | Vanity stamp collection |
| Passport as optional Verification input | Passport score in Builder Score |

**Explicit reject:** Social media stamps (Twitter, Discord) do not affect BCID reputation scores.

---

## 6. zkSync

### What it does well
- Native ZK rollup privacy
- Account abstraction (session keys, paymasters)
- Lower cost for proof verification

### Weaknesses
- Ecosystem fragmentation vs Base (current BC home)
- ZK proof tooling still maturing
- Not an identity protocol itself

### BCID decision
| Adopt | Reject |
|-------|--------|
| ZK proofs for selective disclosure | zkSync as required L2 |
| Proof verification contract on Base | All identity data on zkSync |
| Age/Human/Ownership/KYC proof types | Full migration off Base |

**Boundary:** Encrypted credentials off-chain; ZK proofs verify claims without revealing PII. See [ZK_ARCHITECTURE.md](../architecture/ZK_ARCHITECTURE.md).

---

## 7. Lens

### What it does well
- Profile NFT as identity primitive
- Modular follow/collect/reference
- Creator monetization built-in

### Weaknesses
- Profile NFT is transferable (same ENS problem)
- Reputation = follower/collect metrics
- Chain-specific (Polygon historically)
- No enterprise/asset/agent types

### BCID decision
| Adopt | Reject |
|-------|--------|
| Profile metadata schema patterns | Follower-based reputation |
| Lens handle as linked account | Lens Profile NFT as BCID |
| Content modules concept for credentials UI | Collect-based scoring |

---

## BCID competitive positioning

### vs LinkedIn
| LinkedIn | BCID |
|----------|------|
| Centralized, employer-verified | Self-sovereign, cryptographically verifiable |
| Resume inflation | Contribution proofs with evidence hashes |
| Platform lock-in | Portable credentials + selective disclosure |
| Opaque endorsement | Four auditable reputation scores |

### vs Farcaster
| Farcaster | BCID |
|-----------|------|
| Social-first | Proof-first |
| FID custody | Wallet + guardian recovery |
| Neynar score | Builder/Trust/Contribution/Verification scores |
| In-feed identity | Cross-platform portable identity |

### BCID unique value proposition

1. **Four BCID types** — Human, Company, Asset, Agent (no competitor covers all four)
2. **Verifiable reputation without social vanity** — contributions, not followers
3. **Privacy by default** — encrypted credentials + ZK selective disclosure
4. **Recovery architecture** — guardian timelock (ENS lacks this natively)
5. **Agent ownership** — Agent BCID with wallet, reputation, revenue (ERC-8004 aligned)
6. **Parallel to live `.culture`** — no breaking migration; bridge when ready

---

## Open competitive risks

| Risk | Mitigation |
|------|------------|
| Farcaster adds credentials | BCID focuses on cross-platform portability + BCC economy |
| World ID expands to full identity | BCID composes World ID as one proof input |
| EAS becomes default cred layer | BCID uses EAS as anchor, not competitor |
| Base ecosystem identity standards | Early BCID testnet + Farcaster integration |
