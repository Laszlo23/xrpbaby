# BCID Risk Register

Regulatory, technical, and adoption risks with mitigations and owners.

---

## Risk register

| ID | Risk | Category | Severity | Likelihood | Mitigation | Owner | Status |
|----|------|----------|----------|------------|------------|-------|--------|
| R1 | BCID confused with `.culture` | Adoption | Medium | High | Clear glossary; parallel branding; bridge UX | Product | Open |
| R2 | Low mint uptake (<100 Month 3) | Adoption | High | Medium | GTM playbook; Farcaster Frame; waitlist convert | Growth | Open |
| R3 | World ID regulatory block | Regulatory | High | Low | Tier 1 fallback (Web3.bio); optional Orb | Legal | Open |
| R4 | Smart contract vulnerability | Technical | Critical | Low | Audit before mainnet; testnet Month 2 | Platform | Open |
| R5 | Encrypted storage key loss | Technical | High | Medium | Recovery re-derive; user education | Product | Open |
| R6 | Guardian recovery abuse | Technical | Medium | Medium | Timelock + fee + owner cancel | Security | Open |
| R7 | EAS gas costs on Base spike | Technical | Medium | Medium | Offchain creds for low-trust; batch attest | Platform | Open |
| R8 | Sybil Human BCID farms | Technical | High | High | Nullifier + referral caps + video tier | Security | Open |
| R9 | BCC price volatility affects mint fee | Economic | Low | High | Oracle TWAP; USD-pegged mint price | Token ops | Mitigated |
| R10 | Farcaster API dependency | Technical | Medium | Medium | Cache FID links; graceful degrade | Platform | Open |
| R11 | GDPR erasure vs immutable onchain | Regulatory | Medium | Medium | Encrypted offchain PII; revoke creds only | Legal | Open |
| R12 | Agent BCID liability | Regulatory | High | Medium | Policy hash; spend caps; owner delegation | Product | Open |
| R13 | Storage provider outage | Technical | Medium | Low | S3 backup tier; CID re-pin | Platform | Open |
| R14 | Competitor launches similar protocol | Market | Medium | Medium | Speed to 100 BCIDs; BCC economy moat | Ecosystem | Open |
| R15 | Team bandwidth (10 workstreams) | Operational | High | High | Outcome-based agents; Month 2 scope cut | CEO | Open |

---

## Month 1–2 scope cuts (approved)

| Deferred | Reason |
|----------|--------|
| Company/Asset BCID mint | Human BCID only for Month 2–3 |
| Full ZK circuits | Stub verifier; Month 6 |
| Arweave integration | Spec only; Month 5 |
| Mainnet deploy | Testnet Month 2; mainnet Month 3 |
| EAS onchain for all creds | High-trust only Month 2 |

---

## Review cadence

- Weekly: R2, R8, R15 (adoption + sybil + bandwidth)
- Monthly: Full register review in ecosystem KPI meeting
- Pre-mainnet: R4 mandatory audit gate

Update after each review in this file.
