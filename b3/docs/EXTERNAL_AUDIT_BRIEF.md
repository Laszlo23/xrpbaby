# External smart-contract audit — brief

**Targets:** `AgentShareCampaign`, `BuildingCultureDollar`, `RaffleTicketCampaign`, `BCDGenesisClaim`, `GenesisVaultPass` (as deployed on Base).

## Engagements to request quotes from

- Spearbit, Cantina, Sherlock (competitive), or equivalent reputable firm.

## Scope

- Access control (owner, pausable paths, mint caps).
- Raffle randomness model (commit / reveal / `blockhash` window) vs. stated user expectations.
- Economic parameters (fees, referrals, owner mint).
- Upgradeability assumptions (none unless explicitly documented).

## Deliverables

- Written report with severities and fix recommendations.
- Re-review after fixes (spot-check).

## Repo checklist before kickoff

- `forge test` green on pinned commit.
- Deployment addresses + ABIs in `packages/contracts-sdk`.
- This brief + `TREASURY_POLICY.md` shared under NDA.

*Scheduling the audit is an operator action; this file records intent and scope.*
