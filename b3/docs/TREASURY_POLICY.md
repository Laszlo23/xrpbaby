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

## Autonomous agent wallet caps (CEO orchestrator)

When `ceo-orchestrator-0` runs with deployer/ops keys configured:

| Cap | Default env | Scope |
|-----|-------------|--------|
| Ops gas / day | `AGENT_OPS_DAILY_GAS_CAP_ETH=0.05` | Hot ops wallet txs |
| Deployer gas / day | `AGENT_DEPLOYER_DAILY_GAS_CAP_ETH=0.05` | Contract deploys, owner txs |
| Deploy spend / day | `AGENT_DAILY_DEPLOY_CAP_USD=50` | App + infra deploy tasks |
| Contract deploys / week | `AGENT_WEEKLY_CONTRACT_DEPLOY_CAP=1` | `forge script --broadcast` |

**Never autonomous:** treasury Safe (`0xCe03…`) — no private key in agent env.

**Emergency:** `AGENTS_PAUSED=1` stops all ticks including wallet signing.

**Cap escalation:** CEO may queue higher-cap tasks only when `AgentOutcome.rewardScore` exceeds the 7-day baseline (see `packages/agent-runtime/src/outcome/prompt-promotion.ts`).

## BCC monetary policy

- `BuildingCultureDollar.ownerMint` is gated (`ownerMintDisabled`) — do not re-enable without published schedule + multisig + (if required) timelock.

## Review cadence

- Monthly: reconcile on-chain balances vs. internal ledger expectations (agent-runtime + Safe UI).

## XRPL testnet intake (optional)

| Field | Value |
|-------|--------|
| Network | XRPL Testnet (default `XRPL_NETWORK=testnet`) |
| Address | `XRPL_TREASURY_INTAKE_ADDRESS` — fund via [testnet faucet](https://faucet.altnet.rippletest.net/) |
| Role | Diligence demo rail on `/investors` — **not** protocol reserves |
| Mainnet | **Disabled by default** — counsel + multisig before any mainnet XRPL treasury |

See [XRPL_TREASURY_RAIL.md](./XRPL_TREASURY_RAIL.md). Code guard: `isXrplExecutionAllowed()` blocks mainnet execution even when `XRPL_EXECUTION_ENABLED=1`.

## Public transparency

Live labeled wallet balances: `/investors` and `GET /api/investors/treasury-balances`.
