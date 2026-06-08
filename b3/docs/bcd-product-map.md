# Legacy BCD product map (historical reference)

Legacy context only. This file captures earlier BCD-era assumptions and mixed-chain wiring notes.

Canonical strategy and goals now live in:

- [ECOSYSTEM_GOALS_AND_ROADMAP.md](./ECOSYSTEM_GOALS_AND_ROADMAP.md)
- [BCC_TOKEN.md](./BCC_TOKEN.md)
- [README.md](./README.md)

Use **BCC** language for current external communication. Keep this document for historical traceability only.

## Historical snapshot (implemented or partially wired at the time)

| Flow | Mechanism | Notes |
|------|-----------|--------|
| **Earn / accumulate BCD** | Genesis merkle claim (`BCDGenesisClaim`), optional sale contract, in-app **demo balance** when token unset | Legacy config used `VITE_BCD_TOKEN_ADDRESS`, `VITE_BCD_GENESIS_CLAIM_ADDRESS`, etc. |
| **Spend BCC (story)** | Ticket mint UX, missions, leaderboard narrative | Raffle settlement paths vary by deployed bytecode; UI explains ETH vs BCC where relevant (`faq`, `GetBcdModal`). |
| **Spend BCC (target)** | **RaffleTicketCampaign** supports BCD-style settlement when wired | See Solidity NatSpec in `RaffleTicketCampaign.sol`. |
| **View balance** | `useBcdBalance` on chain **`VITE_BCD_CHAIN_ID`** (defaulted to **8333** in old flows) | Historical setup; not canonical for current Base-first BCC messaging. |
| **Tickets / experiences** | `VITE_RAFFLE_CAMPAIGN_ADDRESS` on **`VITE_EVM_NETWORK`** (default Base) | Separate chain from BCC is OK — users may switch networks for tickets vs BCC until unified deployment. |

## Historical roadmap notes (hub lane)

| Idea | Purpose |
|------|---------|
| **Hub access / perks** | Discount or priority booking for stays/events at Bernhardsthal + future sites |
| **Governance signals** | Snapshot / off-chain first; on-chain voting only with legal clarity |
| **Revenue / treasury routing** | Multisig + disclosures — requires counsel before token claims |

Defer **HubMembership NFT** or **RevenueShareVault** contracts until treasury model and jurisdiction are defined ([`contracts-hardening.md`](contracts-hardening.md)).

## Legacy env variables (reference)

- `VITE_BCD_TOKEN_ADDRESS`, `VITE_BCD_CHAIN_ID`
- `VITE_EVM_NETWORK`, `VITE_RAFFLE_CAMPAIGN_ADDRESS`
- `VITE_ECO_HUB_LANDING_URL` — links main app footer to the eco landing
