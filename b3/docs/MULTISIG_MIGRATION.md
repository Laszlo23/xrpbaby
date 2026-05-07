# Multisig migration (Base) — operator runbook

**Goal:** Move `Ownable` on all revenue-facing contracts from a hot EOA to a **Gnosis Safe 2-of-3** on Base (8453).

## Preconditions

- Canonical Safe address: see `TREASURY_POLICY.md` (“Canonical Safe (multisig)”). On Base: `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`.
- Safe deployed with 3 signers; 2-of-3 threshold.
- Hardware wallets / cold signers configured; no shared seed phrases.
- New deploy addresses documented in `contracts/deployments/8453.json` after any redeploy.

## Contracts (typical)

- `BuildingCultureDollar`
- `BCDGenesisClaim`
- `AgentShareCampaign`
- `RaffleTicketCampaign`
- Optional: `DailyCheckIn`, `GenesisVaultPass` tiers

## Steps (per contract)

1. **Transfer ownership**  
   `safe.transferOwnership(safeAddress)` or `Ownable2Step` accept pattern if adopted.
2. **Verify on Basescan** — owner reads as Safe.
3. **Update env** — `VITE_*` and server env in frontend / Strapi / agent-runtime to match new addresses if bytecode changed.
4. **Pause drills** — confirm `Pausable` contracts can `pause()` / `unpause()` from Safe.

## Post-migration

- Burn or retire old EOA signing keys used only for ownership.
- File a short note in `INCIDENT_RUNBOOK.md` if any ownership transfer fails mid-flight.

This document satisfies the **repo-side** checklist for multisig cutover; execution is intentionally manual.
