# 0G APAC Hackathon — submission pack

This doc is the “single source of truth” for HackQuest submission fields and judge verification.

**Judges:** start at [0G_HACKATHON_JUDGE_README.md](./0G_HACKATHON_JUDGE_README.md) (architecture, repro, form copy).

Hackathon page: [0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon)

## 1) Basic project info (copy/paste)

- **Project name**: BUILDCHAIN Agent ID
- **Track**: Agentic Infrastructure & OpenClaw Lab (Track 1)
- **Pitch**: We're building **BUILDCHAIN Agent ID**, an on-chain identity layer for AI agents on the 0G Chain. Using ERC-721, agents receive portable, user-owned identities that can be verified and integrated across decentralized applications.
- **One‑sentence description (≤30 words)**: BUILDCHAIN Agent ID: ERC-721 on 0G Chain gives AI agents portable, user-owned identities verifiable across decentralized applications.
- **What problem it solves**: AI agents lack portable, user-owned identity that dApps can verify on-chain; we anchor that with ERC-721 on 0G mainnet plus a judge-ready proof page.
- **0G component(s) used**: **0G Chain** (mainnet deployment) + **Agent ID** (ownable ERC‑721).

## 2) Code repository

- Repo: https://github.com/Laszlo23/xrpbaby (monorepo; hackathon code under `b3/`)
- **Judge README**: [0G_HACKATHON_JUDGE_README.md](./0G_HACKATHON_JUDGE_README.md)
- Key paths:
  - `b3/contracts/src/AgentId.sol`
  - `b3/contracts/script/DeployAgentId.s.sol`
  - `b3/app/src/routes/0g.agentid.tsx`
  - `b3/app/public/0g/agentid/1.json` — ERC‑721 metadata for token `#1`

## 3) 0G integration proof (required)

### Live proof (production)

- **Proof page**: https://app.buildingcultureid.space/0g/agentid

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

### HackQuest form — “0G On-Chain Integration Proof” (≤300 chars)

```
AgentId ERC-721 on 0G mainnet (16661). Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e. Explorer: https://chainscan.0g.ai/address/0x0451b1d37058ad57df22d7185aabc6b0a36fc41e#code. Live proof: https://app.buildingcultureid.space/0g/agentid
```

Also on proof page: **Copy HQ on-chain**.

## 4) Demo video (required)

- **Video (≤3 min)**: TODO — add Loom/YouTube link here after upload
- **Operator guide**: [0G_HACKATHON_VIDEO_AND_X.md](./archive/0G_HACKATHON_VIDEO_AND_X.md) — shot list, X template, HackQuest fields
- **In-app**: http://localhost:5173/0g/agentid or https://app.buildingcultureid.space/0g/agentid

### Record this (2:30 — leaves buffer)

| Time | Action | Say this |
|------|--------|----------|
| 0:00 | Show production or local `/0g/agentid` | "We're building BUILDCHAIN Agent ID — an on-chain identity layer for AI agents on 0G Chain." |
| 0:20 | Stay on proof page | "Hackathon proof — contract, deploy tx, mint tx, HackQuest copy buttons." |
| 0:40 | Click **View on 0G ChainScan** | "AgentId is an ownable ERC-721 on 0G mainnet, chain 16661." |
| 1:00 | Open deploy + mint tx links | "Deploy and mint are verifiable on ChainScan — not a mock UI." |
| 1:15 | Open `/0g/agentid/1.json` | "Token #1 metadata is served from the app for tokenURI." |
| 1:30 | Open repo: `b3/contracts/src/AgentId.sol` | "Minimal surface: mint, base URI, ownable — easy to audit." |
| 1:50 | Optional: `cd b3/app && npm run dev` | "Judges reproduce locally in under a minute — see judge README." |
| 2:10 | Close on contract address on screen | "Agent ID = ownership anchor for agents, apps, and automation on 0G." |

### One-liner for judges

> This ERC‑721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.

## 5) README / documentation (required)

Judges should read [0G_HACKATHON_JUDGE_README.md](./0G_HACKATHON_JUDGE_README.md), then reproduce:

```bash
cd b3/app
npm install
npm run dev
```

Then open `/0g/agentid`.

The proof page reads `VITE_OG_AGENT_ID_*` at build time (see `app/.env.example`). Defaults match the mainnet deployment above when env is unset.

Contract verification (optional): `b3/contracts/scripts/verify-agentid-0g.sh` (needs `ETHERSCAN_API_KEY` + `AGENT_ID_OWNER`).

## 6) Public X post (required)

- **Post URL**: TODO — paste after you publish
- **Copy from app**: `/0g/agentid` → **Copy X post**, or use [0G_HACKATHON_VIDEO_AND_X.md](./archive/0G_HACKATHON_VIDEO_AND_X.md)

### Copy/paste X template

```
BUILDCHAIN Agent ID on @0G_labs

On-chain identity layer for AI agents on 0G Chain — ERC-721 portable, user-owned IDs for dApps. Mainnet deploy + proof page:

Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e

Proof: https://app.buildingcultureid.space/0g/agentid

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```

Attach a **screenshot** of the proof page or a short screen recording.

## 7) Related docs

- [0G_HACKATHON_JUDGE_README.md](./0G_HACKATHON_JUDGE_README.md) — **start here (judges)**
- [0G_HACKATHON_VIDEO_AND_X.md](./archive/0G_HACKATHON_VIDEO_AND_X.md) — video + X checklist (operators)
- [ADDRESSES.md](./ADDRESSES.md) — 0G mainnet AgentId registry entry
- [../app/README.md](../app/README.md) — `/0g/agentid` route and env vars

## 8) Pre-submit checklist

**Last automated verification:** 2026-06-05 (local + production smoke)

- [ ] Demo video uploaded (≤3 min) — link in §4 above
- [ ] Public X post with `#0GHackathon` `#BuildOn0G` + screenshot — link in §6 above
- [ ] HackQuest project form filled (name, description, repo, video, X link, components, contract)
- [x] `/0g/agentid` loads with ChainScan links (production `HTTP/2 200` via growth audit)
- [x] `/0g/agentid/1.json` returns metadata (served from `app/public/0g/agentid/1.json`)
- [ ] Contract verified on ChainScan (optional — run `verify-agentid-0g.sh`)
- [x] `cd b3/contracts && forge test --match-contract AgentId` passes (5/5)
- [ ] `cd b3/app && npx playwright test e2e/og-agentid.spec.ts` passes
- [ ] `cd b3/app && npm run typecheck && npm run build` passes

### Security pre-push (same repo)

| Check | Result |
|-------|--------|
| `npm run audit:env` | Pass — no missing required integration vars; `.env` gitignored |
| `npm run growth:audit` | Pass — Grove/Telegram smoke OK |
| `npm run audit:app` / `npm audit` | **43 moderate** — transitive `@reown/appkit` / `@walletconnect/*` (wallet UI); no critical/high; track upstream |
| Secrets in git | None committed (`app/.env`, `deploy/.env` ignored) |
| AgentId contract tests | 5/5 pass |

Operator-only before HackQuest submit: demo video + public X post (§4, §6).

## 9) Same monorepo, out of hackathon scope

The `b3/` app also ships **Building Culture** ecosystem modules (BC Studio at `/studio`, impact betas Ankommen / KinderStimme). Those are **not** part of the Agent ID judging surface — judges should stay on `/0g/agentid` and `b3/contracts/src/AgentId.sol`.
