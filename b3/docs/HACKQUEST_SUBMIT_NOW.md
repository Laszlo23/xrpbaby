# HackQuest — submit BUILDCHAIN Agent ID now

**Live proof:** https://app.buildingcultureid.space/0g/agentid  
**Hackathon:** https://www.hackquest.io/hackathons/0G-APAC-Hackathon

Open the proof page and use the copy chips (**HQ on-chain**, **HQ GitHub**, **X post**, etc.).

## 1. Sign in

1. Go to [HackQuest 0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon)
2. **Sign in** (GitHub recommended — same as repo owner)
3. Register / join the hackathon if prompted

## 2. Create or edit project

| Field | Value |
|-------|--------|
| **Project name** | BUILDCHAIN Agent ID |
| **Description** | Use **Copy Pitch** on proof page |
| **One sentence (≤30 words)** | Use **Copy ≤30 words** |
| **0G components** | ☑ 0G Chain · ☑ Agent ID |
| **GitHub** | https://github.com/Laszlo23/xrpbaby |
| **Demo URL** | https://app.buildingcultureid.space/0g/agentid |
| **Contract** | `0x0451b1d37058ad57df22d7185aabc6b0a36fc41e` |
| **On-chain proof** | **Copy HQ on-chain** |
| **Repo notes** | **Copy HQ GitHub** |
| **Judge README** | https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/0G_HACKATHON_JUDGE_README.md |

## 3. Still required (you)

- [ ] **Demo video** (≤3 min) — [shot list](./archive/0G_HACKATHON_VIDEO_AND_X.md)
- [ ] **X post** with screenshot — **Copy X post** on proof page, hashtags `#0GHackathon` `#BuildOn0G`
- [ ] Paste video + tweet URLs into HackQuest + [0G_HACKATHON_SUBMISSION.md](./0G_HACKATHON_SUBMISSION.md)

## 4. Verify before submit

```bash
curl -sI https://app.buildingcultureid.space/0g/agentid | head -1   # HTTP/2 200
curl -s https://app.buildingcultureid.space/0g/agentid/1.json | head -3
cd b3/contracts && forge test --match-contract AgentId
cd b3 && npm run audit:env && npm run growth:audit
```

**Verified 2026-06-05:** production proof page up, AgentId forge tests 5/5, `audit:env` + `growth:audit` pass. Still need **demo video** + **X post** before final HackQuest submit (see [0G_HACKATHON_SUBMISSION.md](./0G_HACKATHON_SUBMISSION.md) §8).
