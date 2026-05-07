# Treasury policy (draft)

> **Status:** Operations draft — align with counsel and multisig signers before public commitments.

## Principles

1. **No single EOA** for protocol-owned funds — use Safe **2-of-3** (see `MULTISIG_MIGRATION.md`).
2. **Segregation** — marketing / agent ops wallets hold **limited** float; protocol reserves live behind multisig.
3. **Transparency** — publish major treasury moves (large transfers, new custodians) on the canonical comms channel after execution.
4. **Incident-first** — any suspected key leak triggers `INCIDENT_RUNBOOK.md` before routine transfers.

## Canonical Safe (multisig)

| Field     | Value                                                                 |
|-----------|-----------------------------------------------------------------------|
| Network   | Base (chainId 8453)                                                   |
| Address   | `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`                          |
| App URL   | https://app.safe.global/home?safe=base:0xCe03F6E734cC48393Ce41b257E998c68b521EB5c |
| Role      | Protocol treasury / future contract owner                             |
| Threshold | Verified in Safe UI (signers and threshold); do not duplicate here.  |

Other docs reference this address by anchor; do not redefine it elsewhere.

## Agent runtime

- `ECON_LIVE=0` default in non-prod; only enable with multisig-approved runbooks.
- `AGENTS_PAUSED=1` is the **kill-switch** — stops scheduled ticks without redeploying.

## BCD monetary policy

- `BuildingCultureDollar.ownerMint` is gated (`ownerMintDisabled`) — do not re-enable without published schedule + multisig + (if required) timelock.

## Review cadence

- Monthly: reconcile on-chain balances vs. internal ledger expectations (agent-runtime + Safe UI).
