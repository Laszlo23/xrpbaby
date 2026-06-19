# BCID Protocol Documentation

Building Culture Identity (BCID) v1 is a **parallel identity standard** alongside the live `.culture` NFT trust layer. This tree is the canonical protocol specification.

## Glossary

| Term | Definition |
|------|------------|
| **BCID** | Building Culture Identity — portable, privacy-first identity with verifiable reputation |
| **Culture ID** | Live `.culture` ERC-721 namespace on Base (transferable); remains production |
| **Human BCID** | Soulbound identity for individuals |
| **Company BCID** | Identity for organizations with delegated admins |
| **Asset BCID** | Identity for tokenized physical/digital assets |
| **Agent BCID** | Identity for AI agents with wallet + reputation |
| **Credential** | Verifiable attestation bound to a BCID (soulbound in v1) |
| **Builder Score** | Contribution-based reputation (no vanity social weight) |

## Document index

| Document | Purpose |
|----------|---------|
| [BCID_LITE_PAPER.md](./BCID_LITE_PAPER.md) | 6–8 page protocol overview (public) |
| [BCID_SPEC_RFC.md](./BCID_SPEC_RFC.md) | Specification v1 RFC — public comment |
| [DAO_PARTNERSHIP_BRIEF.md](./DAO_PARTNERSHIP_BRIEF.md) | DAO / protocol pilot offer |
| [EAS_SCHEMA_PACK.md](./EAS_SCHEMA_PACK.md) | EAS credential schemas on Base |
| [OUTREACH_PLAYBOOK.md](./OUTREACH_PLAYBOOK.md) | Human-approved outreach funnel |
| [BCID_V1_PRD.md](./BCID_V1_PRD.md) | Master product requirements |
| [COMPETITOR_ANALYSIS.md](./COMPETITOR_ANALYSIS.md) | Farcaster, ENS, World ID, EAS, Gitcoin Passport, zkSync, Lens |
| [INTEROP_CULTURE_ID.md](./INTEROP_CULTURE_ID.md) | `.culture` → BCID bridge rules |
| [TOKENOMICS.md](./TOKENOMICS.md) | BCC fee, treasury, validator, burn, agent economy |
| [USER_RESEARCH.md](./USER_RESEARCH.md) | Interview program + pain points |
| [ASSET_METADATA_STANDARDS.md](./ASSET_METADATA_STANDARDS.md) | House/Car/Watch/Business/Certificate NFT schemas |
| [AGENT_ECONOMY.md](./AGENT_ECONOMY.md) | Agent NFT, wallet, reputation, marketplace |
| [GTM_PLAYBOOK.md](./GTM_PLAYBOOK.md) | First 100 BCIDs launch plan |

## Architecture & security

- [`../architecture/`](../architecture/) — identity, wallet, reputation, storage, ZK, API, DB, contracts
- [`../security/`](../security/) — threat model, recovery, privacy, risks

## Relationship to live product

```
Culture ID (.culture)     BCID v1 (parallel)
        │                        │
        └──── INTEROP_CULTURE_ID ─┘
                    │
        Credentials → Reputation → Access → Agents → Economy
```

See [TRUST_LAYER.md](../TRUST_LAYER.md) for the live trust layer. BCID v1 extends — does not replace — production until bridge migration completes.

## Status

| Component | Status |
|-----------|--------|
| Protocol spec | Draft v1 |
| Testnet contracts | `contracts/src/bcid/` |
| App integration | `/api/bcid/*` |
| Mainnet BCID | Month 3 target (100 Human BCIDs) |
