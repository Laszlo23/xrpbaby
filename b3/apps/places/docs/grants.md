# Grant readiness — Building Culture on 0G

This document is for **ecosystem grants**, **hackathon finals**, and **investor due diligence**. It states what is **shipped**, what is **demo / testnet**, and what **production** requires.

## One-line pitch

**Building Culture** is an open, EVM-native stack for **tokenized real-estate exposure** on **0G Chain**: on-chain property registry, compliance-aware share tokens, AMM liquidity (OG/WETH ↔ shares), optional soulbound proof NFTs, and a **production-style web app** (onboarding, buy, pool, portfolio, legal transparency).

## Problem

Fractional real estate needs **clear settlement**, **liquidity paths**, and **compliance hooks** — not only a whitepaper. Teams need a **reference architecture** they can deploy, audit, and extend.

## Solution (this repo)

| Layer | Deliverable |
|-------|-------------|
| **Chain** | `PropertyRegistry`, `PropertyShareFactory`, `RestrictedPropertyShareToken`, `ComplianceRegistry`, `OgRouter` + pairs, optional `PropertyShareProof`, `OgStaking` (native OG + cooldown), lending + prediction market demos |
| **Storage story** | Domain model for anchoring **0G Storage** roots on-chain ([domain-model.md](domain-model.md)) |
| **Web** | Next.js app: properties, **Invest** (`/invest`), **Stake** (`/stake`), **Buy** (`/trade`), **Pool**, **Portfolio**, **Admin** (`/admin`, on-chain roles), **Market** (AMM + roadmap CLOB), **Legal**, **Onboarding**, property **detail** pages; WalletConnect optional |
| **Trust** | Explorer-linked flows, disclaimers, grant-oriented copy on the **`/legal`** page in the web app |

## Alignment with 0G ecosystem

- Deploys and runs on **0G EVM** (Galileo testnet in docs; adjust RPC for your network).
- Uses **native OG** for swaps via WETH-style routing patterns in the UI.
- **0G Storage** integration is documented for large artifacts; registry stores commitments ([domain-model.md](domain-model.md)).

## What reviewers can verify (5 minutes)

1. **Contracts:** `forge build && forge test` — all tests pass in CI/local.
2. **Addresses:** After `DeployAll`, sync `deployments/testnet.json` → `web/.env.local` ([deployments/README.md](../deployments/README.md)).
3. **UI:** `cd web && npm run build` — production build succeeds.
4. **On-chain:** Open explorer links from the app (tx, token addresses).
5. **Compliance posture:** Read [compliance.md](compliance.md) + in-app **Legal** page.

## Honest scope boundaries

| Status | Item |
|--------|------|
| **Shipped (testnet)** | Full swap + LP + portfolio paths with real contract bindings when env is set; native OG staking UI when `NEXT_PUBLIC_STAKING` is set |
| **Demo / illustrative** | “Funding meter,” USD/share hints on cards — **not** live offering or TVL oracle |
| **Roadmap** | Order book, live APR, distributor for yield, production KYC provider hardening |
| **Not legal advice** | Tokenization may be regulated; operators need counsel ([compliance.md](compliance.md)) |

## Suggested grant milestones (if requested)

1. **M1 — Open source & docs:** Repo public, README + this file + domain model complete (✅ target).
2. **M2 — Testnet deployment:** Scripted deploy + seeded demo properties + synced env.
3. **M3 — UX & transparency:** Onboarding, property detail, portfolio, legal/grant copy (✅ target).
4. **M4 — Hardening:** External audit scope, subgraph or indexer for volume/APR, mainnet checklist.

## Metrics to report (when you have data)

- Testnet txs (swaps, LPs, mints) via explorer.
- Unique wallets interacting with registry / factory / router (subgraph or indexer).
- Optional: GitHub stars, hackathon placement, pilot LOIs (off-chain).

## Security & audits

- **Before mainnet / real funds:** independent **smart contract audit**, bug bounty, multisig admin, upgraded oracle and compliance config.
- Current repo is suitable for **testnet demos and grants**, not retail mainnet without that layer.

## Open source

License as declared in the repository root; grant programs typically require a **clear OSS license** and **public repo** — confirm before submission.

## Contact & maintenance

For grant RFPs, list a **single maintainer email / Discord** and **expected response time** in your application (fill in when you apply).

---

*This document is a technical and product summary for reviewers, not a securities disclosure.*
