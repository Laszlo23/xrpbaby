# DAO & Protocol Partnership Brief

**Integrate BCID as applicant and member identity** — 2-page brief for DAO tooling, L2 foundations, and grant programs.

Version 1.0 · June 2026  
Contact: hello@buildingcultureid.space · Laszlo Bihary · laszlo.bihary@gmail.com

---

## One-liner

**BCID** is a soulbound builder identity with verifiable credentials and dynamic reputation — portable across your grant forms, Snapshot votes, and Guild gates. It complements ENS (names) and EAS (attestations); it does not replace them.

**Live proof:** [app.buildingcultureid.space/grant-proof](https://app.buildingcultureid.space/grant-proof)

---

## Why integrate BCID?

| Your problem | BCID answer |
|--------------|-------------|
| Grant applicants are hard to verify | `did:bcid:human:*` + `bcid-builder` credential with public resolve API |
| Sybil farmers duplicate wallets | Optional World ID / human-proof signals in Verification Score |
| Reputation = Twitter followers | Four scores based on shipped work — no follower weight |
| Identity silos per platform | Portable DID + EAS-compatible credential schemas on Base |
| Existing `.culture` community | Opt-in bridge — no breaking change to live NFT holders |

---

## Free pilot package (3–5 DAOs)

We offer a **no-cost pilot** for qualified DAOs and ecosystem programs:

| Included | Detail |
|----------|--------|
| **Contributor BCIDs** | Mint or bridge from `.culture` for core team (up to 25 wallets) |
| **Credential types** | `dao-member`, `grant-applicant`, `bcid-builder`, `bcid-contributor` |
| **Public leaderboard** | Your contributors on [/bcid/leaderboard](https://app.buildingcultureid.space/bcid/leaderboard) |
| **Resolve API** | `GET /api/bcid/resolve?did=` — no custom indexer for v1 |
| **EAS schemas** | Co-publish attestations on Base Sepolia → mainnet |
| **Feedback loop** | Structured product input via [/voice](https://app.buildingcultureid.space/voice) shapes RFC v1.1 |

**Pilot duration:** 8 weeks · **Ask from you:** public RFC comment + one forum post + 20-min feedback call

---

## Integration paths

### Path A — Grant applicant identity

1. Add optional field: `BCID DID` or `BCID handle` on your application form
2. Verify at submission: `GET https://app.buildingcultureid.space/api/bcid/resolve?did={did}`
3. Check credential: response includes `credentials[]` with `slug` and `status`
4. Issue `grant-applicant` credential back to approved applicants (pilot issuers)

### Path B — Member gating (Snapshot / Guild / Safe)

1. Gate on `bcid-builder` or `dao-member` credential slug
2. Resolve wallet → BCID via `GET /api/bcid/by-culture?handle=` or wallet lookup
3. Optional: require minimum Builder Score threshold from `GET /api/bcid/scores?did=`

### Path C — EAS co-issuance

1. Register BCID credential schemas from [EAS_SCHEMA_PACK.md](./EAS_SCHEMA_PACK.md)
2. Issue attestations referencing applicant `did:bcid:human:*`
3. BCID app syncs `easAttestationUid` onto `BcidCredential` row

---

## API quick reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/bcid/resolve` | GET | None | Public profile + credentials |
| `/api/bcid/by-culture` | GET | None | Lookup by `.culture` handle |
| `/api/bcid/catalog` | GET | None | Credential type definitions |
| `/api/bcid/scores` | GET | None | Builder/Trust/Contribution/Verification |
| `/api/bcid/bridge/culture` | POST | SIWE | Bridge `.culture` → BCID |
| `/api/bcid/sync` | POST | SIWE | Post-mint sync |

**Base URL:** `https://app.buildingcultureid.space`

---

## Interoperability commitments

BCID explicitly interoperates with:

- **ENS** — linked account, optional `bcid=<did>` text record
- **EAS** — schema pack for third-party issuers on Base
- **World ID / Gitcoin Passport** — optional Verification Score inputs
- **ERC-8004** — Agent BCID in agent-card metadata
- **Farcaster** — FID linked account + Frame mint CTA

We will **not** position BCID as a replacement for these standards in partnership materials.

---

## Grant-proof CTA (for funders)

Every partnership touch includes inspectable shipped-work proof:

```
Grant verifier: https://app.buildingcultureid.space/grant-proof
Business plan:  https://app.buildingcultureid.space/plan
Repo:         https://github.com/Laszlo23/xrpbaby
BCID docs:    https://app.buildingcultureid.space/docs/bcid
```

**Grant payout wallet (Base):** `0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22`

---

## Pilot targets we're engaging

| Segment | Examples |
|---------|----------|
| L2 foundations | Base, Optimism, Arbitrum grant boards |
| DAO tooling | Safe, Snapshot, Guild, Deform |
| Identity protocols | EAS, ERC-8004, World ID devrel |
| Regen / RWA DAOs | Places-adjacent communities |
| Hackathons | HackQuest, ETHGlobal |

---

## Next steps

1. **Reply** to hello@buildingcultureid.space with your DAO name + integration path (A/B/C)
2. **Book** a 20-min call — [USER_RESEARCH.md](./USER_RESEARCH.md) Cal.com link
3. **Comment** on [BCID_SPEC_RFC.md](./BCID_SPEC_RFC.md) — public comment open
4. **Try** mint at [/bcid/mint](https://app.buildingcultureid.space/bcid/mint) or bridge from [/pass](https://app.buildingcultureid.space/pass)

---

## FAQ

**Is BCID transferable?** No — Human BCID is soulbound. `.culture` remains transferable; bridge links them.

**Do we need to run a node?** No for v1 — use hosted resolve API. Self-hosted indexer is a future option.

**Mainnet or testnet?** Registry on Base Sepolia (testnet) and Base mainnet (production rollout). APIs work on both.

**Cost?** Pilot is free. Post-pilot: standard mint fees (ETH or BCC) + optional credential issuance fees.

---

*Partnership brief — not a binding agreement. Pilot terms confirmed per DAO in writing.*
