# BCID v1 Human Review Decisions

Recorded outcomes from Phase 0 PRD review. **Approved for execution.**

---

## Interop decisions

| Decision | Outcome |
|----------|---------|
| BCID vs Culture ID | **Parallel standard** — no breaking changes to `.culture` |
| Bridge timing | Testnet Month 2; mainnet bridge Month 3 |
| Credential migration | Auto-migrate 5 of 6 credential types on bridge |
| Social reputation | **Excluded** from BCID scores (Culture social-trust not fed forward) |
| Dual period | Months 2–4; Culture events at 0.5x weight |

---

## Month 1–2 scope cuts (approved)

| In scope | Out of scope (deferred) |
|----------|-------------------------|
| Human BCID mint (testnet) | Company/Asset/Agent BCID mint |
| Soulbound credential contract | Full ZK circuits |
| Builder Score v1 (4-score engine) | Verification Score live proofs |
| Bridge API spec + implementation | Mainnet deploy (Month 3) |
| Protocol doc tree | Encrypted storage implementation |
| User research program launch | 100 interviews (Month 2 target) |
| Storage/ZK architecture docs | Arweave integration |

---

## Open questions — interim decisions

| # | Question | Interim decision | Final owner |
|---|----------|------------------|-------------|
| 1 | Testnet vs mainnet first 100 | Testnet Month 2; mainnet Month 3 | WS10 |
| 2 | EAS for v1 creds | High-trust only onchain | WS1 |
| 3 | Storage provider | 4EVERLAND primary + S3 backup | WS5 |
| 4 | World ID required? | Optional Tier 2 | WS6 |
| 5 | Bridge BCC incentive | 50 BCC / first 500 (pending treasury) | WS3 |

---

## Sign-off checklist

- [x] Parallel standard confirmed
- [x] Month 2 scope limited to Human BCID
- [x] Social scoring rejected for BCID path
- [x] Threat model reviewed ([THREAT_MODEL.md](../security/THREAT_MODEL.md))
- [x] Risk register published ([RISK_REGISTER.md](../security/RISK_REGISTER.md))
- [ ] Treasury approves 50 BCC bridge incentive (WS3 follow-up)

**Review date:** 2026-06-18  
**Next review:** End Month 1 (user research synthesis)
