# 0G APAC Hackathon — submission pack

This doc is the “single source of truth” for HackQuest submission fields and judge verification.

Hackathon page: [0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon)

## 1) Basic project info (copy/paste)

- **Project name**: BUILDCHAIN — Agent ID proof
- **One‑sentence description (≤30 words)**: A BUILDCHAIN extension that deploys an ownable Agent ID (ERC‑721) on 0G Chain mainnet and exposes verifiable proof links + a lightweight in‑app “agent identity” lane.
- **What problem it solves**: Gives AI agents a transferable, on‑chain identity primitive (“Agent ID”) that can be referenced by apps, users, and automation.
- **0G component(s) used**: **0G Chain** (mainnet deployment) + **Agent ID** concept implemented as an ownable ERC‑721.

## 2) Code repository

- Repo: (this repository)
- Key paths:
  - `b3/contracts/src/AgentId.sol`
  - `b3/contracts/script/DeployAgentId.s.sol`
  - `b3/frontend/src/routes/0g.agentid.tsx`

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

- **Video (≤3 min)**: TODO — add Loom/YouTube link

### Suggested 3‑minute demo script

1. Open the app home: `http://localhost:8080/` (or your hosted URL).
2. Open the proof page: `http://localhost:8080/0g/agentid`.
3. Click:
   - “View on 0G ChainScan” (contract link)
   - Deploy tx link
   - Mint tx link
4. Explain in one line: “This ERC‑721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.”

## 5) README / documentation (required)

Judges should be able to reproduce:

```bash
cd b3/frontend
npm install
npm run dev
```

Then open `/0g/agentid`.

## 6) Public X post (required)

TODO — once you post it, paste the link here.

### Copy/paste X template

BUILDCHAIN — Agent ID proof on @0G_labs

We deployed a minimal Agent ID (ERC‑721) on 0G Chain mainnet and wired an in‑app proof page with explorer links.

Contract: 0x0451b1d37058ad57df22d7185aabc6b0a36fc41e

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_

