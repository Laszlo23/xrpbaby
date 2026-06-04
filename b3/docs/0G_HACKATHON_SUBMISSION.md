# 0G APAC Hackathon — submission pack

This doc is the “single source of truth” for HackQuest submission fields and judge verification.

Hackathon page: [0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon)

## 1) Basic project info (copy/paste)

- **Project name**: BUILDCHAIN — Agent ID proof
- **One‑sentence description (≤30 words)**: A BUILDCHAIN extension that deploys an ownable Agent ID (ERC‑721) on 0G Chain mainnet and exposes verifiable proof links + a lightweight in‑app “agent identity” lane.
- **What problem it solves**: Gives AI agents a transferable, on‑chain identity primitive (“Agent ID”) that can be referenced by apps, users, and automation.
- **0G component(s) used**: **0G Chain** (mainnet deployment) + **Agent ID** concept implemented as an ownable ERC‑721.

## 2) Code repository

- Repo: https://github.com/Laszlo23/xrpbaby (monorepo; hackathon code under `b3/`)
- Key paths:
  - `b3/contracts/src/AgentId.sol`
  - `b3/contracts/script/DeployAgentId.s.sol`
  - `b3/app/src/routes/0g.agentid.tsx`

## 3) 0G integration proof (required)

### On-chain proof (0G Chain mainnet)

- **Chain**: 0G Chain mainnet (chainId `16661`)
- **RPC**: `https://evmrpc.0g.ai` (per 0G docs: [Deploy Contracts on 0G Chain](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts))

### Contract + explorer links

- **AgentId contract address**: `0x0451b1d37058ad57df22d7185aabc6b0a36fc41e`
- **Contract on explorer**: `https://chainscan.0g.ai/address/0x0451b1d37058ad57df22d7185aabc6b0a36fc41e#code`

### Transaction proof

- **Deploy tx**: `0x4629018662bf4f8f1cf6438c749d56307c1fcb4aa79e044f8692c31c88572d3e`
  - Explorer: `https://chainscan.0g.ai/tx/0x4629018662bf4f8f1cf6438c749d56307c1fcb4aa79e044f8692c31c88572d3e`
- **Mint tx**: `0xf920a643320272e067b137e11b85f07afe40e4dfb820e3de3754d68dc945d7d9`
  - Explorer: `https://chainscan.0g.ai/tx/0xf920a643320272e067b137e11b85f07afe40e4dfb820e3de3754d68dc945d7d9`

## 4) Demo video (required)

- **Video (≤3 min)**: TODO — add Loom/YouTube link here after upload
- **Operator guide**: [0G_HACKATHON_VIDEO_AND_X.md](./0G_HACKATHON_VIDEO_AND_X.md) — shot list, X template, HackQuest fields
- **In-app**: http://localhost:5173/0g/agentid — **Copy X post**, demo script, ChainScan buttons

### Record this (2:30 — leaves buffer)

| Time | Action | Say this |
|------|--------|----------|
| 0:00 | Show `http://localhost:5173/` or production URL | "BUILDCHAIN gives AI agents a portable on-chain identity on 0G Chain." |
| 0:20 | Navigate to `/0g/agentid` | "This is our hackathon proof page — contract address, deploy tx, and mint tx." |
| 0:40 | Click **View on 0G ChainScan** | "AgentId is an ownable ERC-721 on 0G mainnet, chain 16661." |
| 1:00 | Open deploy + mint tx links | "Deploy and mint are verifiable on ChainScan — not a mock UI." |
| 1:20 | Open repo: `b3/contracts/src/AgentId.sol` | "Minimal surface area: mint, base URI, ownable — easy to audit." |
| 1:45 | Run `cd b3/app && npm run dev` (optional cut) | "Judges can reproduce locally in under a minute." |
| 2:10 | Close on contract address on screen | "Agent ID = ownership anchor for agents, apps, and automation on 0G." |

### One-liner for judges

> This ERC‑721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.

## 5) README / documentation (required)

Judges should be able to reproduce:

```bash
cd b3/app
npm install
npm run dev
```

Then open `/0g/agentid`.

The proof page reads `VITE_OG_AGENT_ID_*` at build time (see `app/.env.example`). Defaults match the mainnet deployment above when env is unset.

## 6) Public X post (required)

- **Post URL**: TODO — paste after you publish
- **Copy from app**: `/0g/agentid` → **Copy X post**, or use [0G_HACKATHON_VIDEO_AND_X.md](./0G_HACKATHON_VIDEO_AND_X.md)

### Copy/paste X template

BUILDCHAIN — Agent ID proof on @0G_labs

We deployed a minimal Agent ID (ERC‑721) on 0G Chain mainnet and wired an in‑app proof page with explorer links.

Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e

Proof: /0g/agentid

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_

## 7) Related docs

- [0G_HACKATHON_VIDEO_AND_X.md](./0G_HACKATHON_VIDEO_AND_X.md) — video + X checklist (start here)
- [ADDRESSES.md](./ADDRESSES.md) — 0G mainnet AgentId registry entry
- [../app/README.md](../app/README.md) — `/0g/agentid` route and env vars

## 8) Pre-submit checklist

- [ ] Demo video uploaded (≤3 min) — link in §4 above
- [ ] Public X post with `#0GHackathon` `#BuildOn0G` — link in §6 above
- [ ] HackQuest project form filled (name, description, repo, video, X link)
- [ ] `/0g/agentid` loads with ChainScan links (local or production)
- [ ] Contract verified on ChainScan (if not already)
- [ ] `cd b3/contracts && forge test` passes (includes `AgentId.t.sol`)
- [x] `cd b3/app && npm run verify` passes (lint + typecheck + build)
