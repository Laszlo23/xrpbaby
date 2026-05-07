# BCD product map (earn → spend → IRL)

Internal reference for how **Building Culture Dollar (BCD)** ties the **digital lane** (0x / BUILDCHAIN app) to the **physical lane** (eco hubs, revival — see `ecorwa`). Adjust as prod contracts and legal constraints firm up.

## Today (implemented or partially wired)

| Flow | Mechanism | Notes |
|------|-----------|--------|
| **Earn / accumulate BCD** | Genesis merkle claim (`BCDGenesisClaim`), optional sale contract, in-app **demo balance** when token unset | Configure `VITE_BCD_TOKEN_ADDRESS`, `VITE_BCD_GENESIS_CLAIM_ADDRESS`, etc. |
| **Spend BCD (story)** | Ticket mint UX, missions, leaderboard narrative | Raffle settlement paths vary by deployed bytecode; UI explains ETH vs BCD where relevant (`faq`, `GetBcdModal`). |
| **Spend BCD (target)** | **RaffleTicketCampaign** supports BCD-style settlement when wired | See Solidity NatSpec in `RaffleTicketCampaign.sol`. |
| **View balance** | `useBcdBalance` on chain **`VITE_BCD_CHAIN_ID`** (defaults **8333** B3) | Must match token deployment; prompt uses `getBcdChainShortLabel()`. |
| **Tickets / experiences** | `VITE_RAFFLE_CAMPAIGN_ADDRESS` on **`VITE_EVM_NETWORK`** (default Base) | Separate chain from BCD is OK — users may switch networks for tickets vs BCD until unified deployment. |

## Roadmap (hub lane — not implemented)

| Idea | Purpose |
|------|---------|
| **Hub access / perks** | Discount or priority booking for stays/events at Bernhardsthal + future sites |
| **Governance signals** | Snapshot / off-chain first; on-chain voting only with legal clarity |
| **Revenue / treasury routing** | Multisig + disclosures — requires counsel before token claims |

Defer **HubMembership NFT** or **RevenueShareVault** contracts until treasury model and jurisdiction are defined ([`contracts-hardening.md`](contracts-hardening.md)).

## Related env vars

- `VITE_BCD_TOKEN_ADDRESS`, `VITE_BCD_CHAIN_ID`
- `VITE_EVM_NETWORK`, `VITE_RAFFLE_CAMPAIGN_ADDRESS`
- `VITE_ECO_HUB_LANDING_URL` — links main app footer to the eco landing
