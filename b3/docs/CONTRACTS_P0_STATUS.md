# Contracts P0 — implementation status (repo)

| Item | Code / docs | On-chain operator work |
|------|-------------|----------------------|
| Raffle entropy | `RaffleTicketCampaign` commit-before-close + `blockhash` mix (see Solidity) | Redeploy + migrate addresses |
| Pausable AGS / Vault | `Pausable` on `AgentShareCampaign`, `GenesisVaultPass` | Redeploy + update env |
| BCD `ownerMint` | `disableOwnerMintForever()` + gate | Multisig + policy |
| Multisig ownership | — | `MULTISIG_MIGRATION.md` |

Treat rows in the right column as **mandatory** before scaling public sales; the left column is what this repository encodes today.
