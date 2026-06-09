# Grant submissions — Building Culture

**Operator:** Laszlo Bihary · **laszlo.bihary@gmail.com**  
**Grant payout wallet (Base):** `0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22`  
**Live proof:** [app.buildingcultureid.space/grant-proof](https://app.buildingcultureid.space/grant-proof)

---

## Rundown (what you have today)

| Asset | Status |
|-------|--------|
| Production app | Live — 36 automated checks pass, 4 honest warns |
| Base mainnet | Identity, BCC, Places RWA, pulse anchor — bytecode audited |
| 0G AgentId | ERC-721 on 0G mainnet + judge proof page |
| Telegram Mini App | Live (`/tg`) |
| Grant verifier | `/grant-proof` + `/api/grant/verification` |
| Proof bundle | `npm run grant:proof` → JSON + markdown in `proof-bundles/` |
| Business plan (site) | https://app.buildingcultureid.space/plan — native content, illustrative projections |
| Culture Points → BCC | Treasury-backed redeem pipeline shipped (see `SMART_WALLET_AND_PACKS.md`) |
| Tests cited | 33 package unit, 45+47 forge, 78 Playwright (see `TEST_GATE_SNAPSHOT.json`) |

**Known gaps (disclose in forms):** trading sidecar offline (`/api/trading/health` warn), Grove X/Farcaster not configured, `ECON_LIVE=0`, **Talent Protocol meta on homepage** (in code — redeploy app to clear 3 verifier fails).

**Before submitting:** `./scripts/deploy-ssh.sh` (or your prod deploy) so `talentapp:project_verification` appears on `/` — then re-run `npm run grant:proof` for 0 hard fails.

---

## Can an agent submit for you?

| Action | Agent today | You |
|--------|-------------|-----|
| Generate proof bundle | Yes — `npm run grant:proof` | — |
| Keep verifier green | Yes — weekly `grant:verify` | — |
| Post proof link on X/Farcaster | Partial — Grove agent when `GROVE_X_*` / Neynar set | Connect credentials |
| Fill Google/Deform/Guild forms | **No** — needs your login + KYC identity | **You submit** (copy-paste below) |
| Receive ETH/USDC to wallet | **No** — funders pay after review + KYC | Confirm wallet on forms |

**Grants do not auto-send to a wallet.** Programs review shipped work, may interview you, require KYC, then pay milestones to the address you provide.

**Agent roadmap (optional):** Grove can amplify `/grant-proof` on social; a future `grant-outreach` cron could email RFP aliases — not wired today.

---

## Submission checklist (do in order)

1. [ ] Run fresh bundle: `npm run grant:proof`
2. [ ] Attach `proof-bundles/grant-verification-*.md` + `.json` where forms allow files
3. [ ] Submit **Priority 1** programs below (same week)
4. [ ] Post once on X/Farcaster: live proof link + one-liner (helps Base retroactive discovery)
5. [ ] Save confirmation emails / application IDs in `proof-bundles/submission-log.txt`

---

## Priority 1 — submit this week

### A) Base Builder Grants (1–5 ETH, retroactive)

- **Type:** Nomination / retroactive — team discovers shipped work; community can nominate
- **Docs:** [Base Get Funded](https://docs.base.org/get-started/get-funded)
- **Nomination:** Use the “Apply for Builder Grants” / community nomination link on [Base funding docs](https://docs.base.org/get-started/get-funded) (Deform form; URL may change — open from official docs)
- **You are a strong fit:** Shipped on Base mainnet, public verifier, real contracts

**Nomination / self-nomination copy:**

```
Project: Building Culture (BUILDCHAIN)
Builder: Laszlo Bihary — laszlo.bihary@gmail.com
Wallet (grant payout, Base): 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22

One-liner: Culture receipts on-chain — identity, BCC, fractional real-estate rails (Places), and community surfaces on Base mainnet.

Live app: https://app.buildingcultureid.space
Grant verifier (36 pass / 0 fail): https://app.buildingcultureid.space/grant-proof
Repo: https://github.com/Laszlo23/xrpbaby (b3/)

Shipped on Base: CultureLayerIdentity 0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863, BCC 0xb890a5289f789f1346032ccc1847939e855fab07, Places PropertyRegistry 0x5aca19274B17B97e38da9eA851d91F0CC59DafBf

Why Base: Wallet auth (Privy), Telegram Mini App, thirdweb marketplace, pulse anchor, Culture Points ledger with treasury-backed BCC redemption — bringing users onchain with inspectable settlement.

Business plan: https://app.buildingcultureid.space/plan

Ask: 2–3 ETH retroactive grant for audit hardening + trading sidecar + Points→BCC redemption ops + production runway (RPC, hosting, AI/API credits) + continued Base ecosystem integration.
```

---

### B) Guild on 0G 2.0 ($10K–$1M+ range, rolling)

- **Apply:** [guild.0gfoundation.ai](https://guild.0gfoundation.ai/) → [Application form](https://guild.0gfoundation.ai/apply)
- **Step 1:** Post on [hall.0g.ai](https://hall.0g.ai) — category **Guild on 0G 2.0**
- **Step 2:** Complete 5-step form
- **Fit:** BUILDCHAIN Agent ID already on 0G mainnet; extend agent + storage story

**Guild Hall post (title + body):**

```
Title: BUILDCHAIN Agent ID + Building Culture — portable agent identity on 0G

Building Culture ships BUILDCHAIN Agent ID (ERC-721) on 0G Chain mainnet with a live judge proof page. We extend this with culture/RWA surfaces on Base and agent-card interoperability.

Proof: https://app.buildingcultureid.space/0g/agentid
Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e
Contact: laszlo.bihary@gmail.com
Grant wallet: 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22
```

**Application form fields (copy-paste):**

| Field | Value |
|-------|-------|
| Contact email | laszlo.bihary@gmail.com |
| Project name | Building Culture / BUILDCHAIN Agent ID |
| Category | AI agents / Agentic infrastructure |
| Website | https://app.buildingcultureid.space |
| GitHub | https://github.com/Laszlo23/xrpbaby |
| 0G integration | AgentId.sol deployed 0G mainnet 16661; tokenURI + proof UI; roadmap: 0G Storage anchors for Places artifacts |
| Traction | Live production app; grant verifier 36/36 hard checks; hackathon submission pack in repo |
| Funding ask | $25K–$50K milestone 1: deepen Agent ID + agent-card + 0G Storage commitments for RWA docs |
| Payout wallet | 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22 |

**Long description:**

```
Building Culture is a shipped web3 product combining Base mainnet culture identity (CultureLayerIdentity, BCC), Places RWA registry/compliance, and BUILDCHAIN Agent ID on 0G Chain mainnet (ERC-721). Judges can verify deploy and mint in under one minute at /0g/agentid. A public grant verifier at /grant-proof shows 36 automated production checks passing.

Problem: AI agents and culture/RWA apps lack portable, user-owned identity and inspectable settlement.

Solution: AgentId on 0G + unified app on Base + Telegram growth + public verification lane for funders.

Milestones: (M1) Agent ID v2 metadata + agent-card interop (M2) 0G Storage roots on Places registry (M3) agent runtime hardening.

Contact: laszlo.bihary@gmail.com | Grant wallet: 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22
```

---

### C) 0G APAC Hackathon follow-up (if still open)

- **Pack:** [0G_HACKATHON_SUBMISSION.md](0G_HACKATHON_SUBMISSION.md)
- **Judge README:** [0G_HACKATHON_JUDGE_README.md](0G_HACKATHON_JUDGE_README.md)
- Add contact: laszlo.bihary@gmail.com | wallet: 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22

---

## Priority 2 — next 2–4 weeks

### D) Base Builder Rewards / Talent Protocol (2 ETH/week, activity-based)

- **Domain verification:** `<meta name="talentapp:project_verification" …>` is in global `<head>` on `https://app.buildingcultureid.space/` (see `app/src/lib/seo.ts` → `rootTechnicalMeta()`). Re-verify in Talent app after deploy.
- Join via [Base Get Funded → Weekly Rewards / Talent Protocol](https://docs.base.org/get-funded)
- Post build updates linking `/grant-proof` and shipped Base txs

### E) Optimism RetroPGF / Atlas (public goods)

- If you open-source verification scripts + ADDRESSES index as public good
- Track on [Optimism Atlas](https://atlas.optimism.io/) (URL per current OP docs)

### F) Chainlink BUILD / partner programs

- Narrative: [CHAINLINK_RWA_COMPLIANCE.md](CHAINLINK_RWA_COMPLIANCE.md)
- Contact via [CHAINLINK_PARTNER_ONBOARDING.md](CHAINLINK_PARTNER_ONBOARDING.md) — use same email + wallet

### G) EU / social impact (narrative only — no auto-submit)

- Use `/forest`, `/join`, `/signal` live URLs from grant bundle
- Programs vary by country; attach `grant-verification-*.md` to manual RFPs

---

## Social post (helps Base retroactive grants)

Post from your account (agent can do this when Grove X is configured):

```
Shipped on @base: Building Culture — identity, BCC, Places RWA, Telegram mini app.

Verify in 5 min (36 checks passing):
https://app.buildingcultureid.space/grant-proof

0G Agent ID proof:
https://app.buildingcultureid.space/0g/agentid

Open source: github.com/Laszlo23/xrpbaby
```

---

## Budget template (attach to larger grants)

| Milestone | Amount | Deliverable |
|-----------|--------|-------------|
| M1 Security | $15–25K | External audit scope for Places + identity contracts |
| M2 Agents | $10–20K | Trading sidecar + agent-card production |
| M3 0G depth | $15–30K | Storage anchors + Agent ID v2 |
| M4 Growth | $5–10K | Telegram + community impact programs |
| M5 Ops runway | $3–8K | 12 months: VPS, Base RPC, indexer, Cursor/AI API credits, monitoring |

**Total ask (Guild / ecosystem):** $48K–$93K phased  
**Base Builder Grant ask:** 2–3 ETH retroactive (~$6–9K at spot — ops + audit prep)

---

## Quidli social rewards (BCC on Base)

- Webhook: `GET /api/webhooks/quidli` → `configured: true` when `QUIDLI_API_KEY` is set
- Status: `GET /api/marketing/quidli/status` — caps, recent deliveries, grant bounty URL
- Register dashboard webhook: `https://app.buildingcultureid.space/api/webhooks/quidli`
- BCC token: `0xb890a5289f789f1346032ccc1847939e855fab07` (chain 8453)
- Grant verifier checks: `quidli_webhook_registered`, `quidli_bcc_configured`
- Weekly top-3 Culture Points → Quidli drops: `npm run quidli:leaderboard-drops` (cron via `scripts/install-quidli-cron.sh`)

---

## Files to attach

- Latest: `proof-bundles/grant-verification-20260608T203943Z.md` (**42 pass / 0 fail**)
- JSON: `proof-bundles/grant-proof-20260608T203943Z.json`
- Submission log: `proof-bundles/submission-log.txt`
- Copy-paste fields: `node scripts/print-grant-submission-fields.mjs`
- Index: [GRANT_READINESS_PACK.md](GRANT_READINESS_PACK.md)
- Addresses: [ADDRESSES.json](ADDRESSES.json)

---

*Technical pack — not legal advice. Confirm entity name and tax forms at KYC.*
