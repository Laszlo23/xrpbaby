# 0G hackathon — video + X (operator checklist)

Use this while recording and posting. Canonical addresses live in [0G_HACKATHON_SUBMISSION.md](./0G_HACKATHON_SUBMISSION.md).

Hackathon: [0G APAC Hackathon on HackQuest](https://www.hackquest.io/hackathons/0G-APAC-Hackathon)

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
cd b3/app && npm run typecheck
```

**No wallet or Postgres required** for the proof page — only static links and copy buttons.

Production alternative (if deployed): `https://app.buildingcultureid.space/0g/agentid` (same path).

---

## Demo video (≤3 min)

Upload to **Loom** or **YouTube (unlisted)**. Paste the link into:

- `b3/docs/0G_HACKATHON_SUBMISSION.md` → §4
- HackQuest project form → Demo video

### Shot list

| Time | Do | Say |
|------|-----|-----|
| 0:00 | Browser on `/` or `/0g/agentid` | "BUILDCHAIN gives AI agents a portable on-chain identity on 0G Chain." |
| 0:20 | Stay on `/0g/agentid` | "Hackathon proof page — contract, deploy tx, mint tx." |
| 0:40 | Click **View on 0G ChainScan** | "AgentId is an ownable ERC-721 on 0G mainnet, chain 16661." |
| 1:00 | Open deploy tx, then mint tx | "Deploy and mint are verifiable on ChainScan — not a mock UI." |
| 1:20 | Tab: GitHub `b3/contracts/src/AgentId.sol` | "Small surface: mint, base URI, ownable." |
| 1:45 | Optional: terminal `npm run dev` in `b3/app` | "Judges can reproduce locally in under a minute." |
| 2:10 | Back to proof page — contract visible | "Agent ID = ownership anchor for agents, apps, and automation on 0G." |

**Judge one-liner** (also on the page):

> This ERC-721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.

### Recording tips

- 1920×1080, hide bookmarks bar, zoom 110% if text looks small.
- Use **Copy X post** / **Copy proof URL** on `/0g/agentid` when filling forms.
- Keep total under **2:30** to stay inside the 3-minute limit.

---

## X post (required)

1. Open `/0g/agentid` → **Copy X post** (or copy from below).
2. Post on X with hashtags `#0GHackathon` `#BuildOn0G`.
3. Paste the **public post URL** into `0G_HACKATHON_SUBMISSION.md` §6 and HackQuest.

### Copy/paste template

```
BUILDCHAIN — Agent ID proof on @0G_labs

We deployed a minimal Agent ID (ERC-721) on 0G Chain mainnet and wired an in-app proof page with explorer links.

Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e

Proof: /0g/agentid

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```

Add your live app URL in a reply if you want (e.g. `https://app.buildingcultureid.space/0g/agentid`).

---

## HackQuest form (copy/paste)

| Field | Value |
|-------|--------|
| Project name | BUILDCHAIN — Agent ID proof |
| One-sentence (≤30 words) | A BUILDCHAIN extension that deploys an ownable Agent ID (ERC-721) on 0G Chain mainnet and exposes verifiable proof links + a lightweight in-app agent identity lane. |
| Problem | Gives AI agents a transferable, on-chain identity primitive that apps, users, and automation can reference. |
| 0G components | 0G Chain mainnet + Agent ID (ERC-721) |
| Repo | https://github.com/Laszlo23/xrpbaby (paths under `b3/`) |
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

---

## Quick links

| What | URL |
|------|-----|
| Proof page (local) | http://localhost:5173/0g/agentid |
| Contract | https://chainscan.0g.ai/address/0x0451b1d37058ad57df22d7185aabc6b0a36fc41e#code |
| Deploy tx | https://chainscan.0g.ai/tx/0x4629018662bf4f8f1cf6438c749d56307c1fcb4aa79e044f8692c31c88572d3e |
| Mint tx | https://chainscan.0g.ai/tx/0xf920a643320272e067b137e11b85f07afe40e4dfb820e3de3754d68dc945d7d9 |
