# 0G hackathon — video + X (operator checklist)

Use this while recording and posting. Canonical addresses live in [0G_HACKATHON_SUBMISSION.md](./0G_HACKATHON_SUBMISSION.md).

Hackathon: [0G APAC Hackathon on HackQuest](https://www.hackquest.io/hackathons/0G-APAC-Hackathon)

**Production proof URL:** https://app.buildingcultureid.space/0g/agentid

---

## Before you start (5 min)

```bash
cd b3/app
npm run dev
# → http://localhost:5173/0g/agentid
```

Optional sanity:

```bash
cd b3/contracts && forge test --match-contract AgentId
cd b3/app && npx playwright test e2e/og-agentid.spec.ts
cd b3/app && npm run typecheck && npm run build
```

**No wallet or Postgres required** for the proof page — only static links and copy buttons.

---

## Demo video (≤3 min)

Upload to **Loom** or **YouTube (unlisted)**. Paste the link into:

- `b3/docs/0G_HACKATHON_SUBMISSION.md` → §4
- HackQuest project form → Demo video

### Shot list

| Time | Do | Say |
|------|-----|-----|
| 0:00 | Browser on https://app.buildingcultureid.space/0g/agentid (or local) | "We're building BUILDCHAIN Agent ID — on-chain identity for AI agents on 0G Chain, ERC-721, user-owned." |
| 0:20 | Stay on proof page | "Hackathon proof — contract, txs, HackQuest copy buttons." |
| 0:40 | Click **View on 0G ChainScan** | "AgentId is an ownable ERC-721 on 0G mainnet, chain 16661." |
| 1:00 | Open deploy tx, then mint tx | "Deploy and mint are verifiable on ChainScan — not a mock UI." |
| 1:15 | Open `/0g/agentid/1.json` | "Token #1 metadata for ERC-721 tokenURI." |
| 1:30 | Tab: GitHub `b3/contracts/src/AgentId.sol` | "Small surface: mint, base URI, ownable." |
| 1:50 | Optional: terminal `npm run dev` in `b3/app` | "Judges: see 0G_HACKATHON_JUDGE_README.md — repro in under a minute." |
| 2:10 | Back to proof page — contract visible | "Agent ID = ownership anchor for agents, apps, and automation on 0G." |

**Judge one-liner** (also on the page):

> This ERC-721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.

### Recording tips

- 1920×1080, hide bookmarks bar, zoom 110% if text looks small.
- Use **Copy X post** / **Copy proof URL** / **Copy HQ on-chain** on `/0g/agentid`.
- Keep total under **2:30** to stay inside the 3-minute limit.
- Attach the same recording or a screenshot to your X post.

---

## X post (required)

1. Open https://app.buildingcultureid.space/0g/agentid → **Copy X post** (or copy below).
2. Post on X with hashtags `#0GHackathon` `#BuildOn0G`.
3. Include a **screenshot** of the proof page (mandatory per rules).
4. Paste the **public post URL** into `0G_HACKATHON_SUBMISSION.md` §6 and HackQuest.

### Copy/paste template

```
BUILDCHAIN Agent ID on @0G_labs

On-chain identity layer for AI agents on 0G Chain — ERC-721 portable, user-owned IDs for dApps. Mainnet deploy + proof page:

Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e

Proof: https://app.buildingcultureid.space/0g/agentid

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```

---

## HackQuest form (copy/paste)

| Field | Value |
|-------|--------|
| Project name | BUILDCHAIN Agent ID |
| Track (narrative) | Agentic Infrastructure (Track 1) |
| Pitch | We're building BUILDCHAIN Agent ID, an on-chain identity layer for AI agents on the 0G Chain. Using ERC-721, agents receive portable, user-owned identities that can be verified and integrated across decentralized applications. |
| One-sentence (≤30 words) | BUILDCHAIN Agent ID: ERC-721 on 0G Chain gives AI agents portable, user-owned identities verifiable across decentralized applications. |
| Problem | AI agents need portable, user-owned on-chain identity that dApps can verify; we ship ERC-721 on 0G mainnet + proof page. |
| 0G components (checkbox) | **0G Chain**, **Agent ID** |
| On-chain proof (≤300) | Use **Copy HQ on-chain** on `/0g/agentid` |
| GitHub | Use **Copy HQ GitHub** on `/0g/agentid` |
| Repo | https://github.com/Laszlo23/xrpbaby |
| Judge README | b3/docs/0G_HACKATHON_JUDGE_README.md |
| Contract | `0x0451b1d37058ad57df22d7185aabc6b0a36fc41e` |
| ChainScan | https://chainscan.0g.ai/address/0x0451b1d37058ad57df22d7185aabc6b0a36fc41e#code |
| Demo video | *(your Loom/YouTube URL)* |
| X post | *(your tweet URL)* |

---

## After you finish

Update checkboxes in [0G_HACKATHON_SUBMISSION.md](./0G_HACKATHON_SUBMISSION.md) §8:

- [ ] Demo video link
- [ ] X post link
- [ ] HackQuest submitted
- [ ] `/0g/agentid` verified (local or prod)
- [ ] `/0g/agentid/1.json` verified

---

## Quick links

| What | URL |
|------|-----|
| Proof page (production) | https://app.buildingcultureid.space/0g/agentid |
| Proof page (local) | http://localhost:5173/0g/agentid |
| Token metadata | https://app.buildingcultureid.space/0g/agentid/1.json |
| Contract | https://chainscan.0g.ai/address/0x0451b1d37058ad57df22d7185aabc6b0a36fc41e#code |
| Deploy tx | https://chainscan.0g.ai/tx/0x4629018662bf4f8f1cf6438c749d56307c1fcb4aa79e044f8692c31c88572d3e |
| Mint tx | https://chainscan.0g.ai/tx/0xf920a643320272e067b137e11b85f07afe40e4dfb820e3de3754d68dc945d7d9 |
| HackQuest | https://www.hackquest.io/hackathons/0G-APAC-Hackathon |
