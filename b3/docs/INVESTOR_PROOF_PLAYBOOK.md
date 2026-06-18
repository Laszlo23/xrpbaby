# Investor proof playbook

Use this playbook to produce recurring, audit-friendly proof artifacts for partners and investors.

## Proof bundle command

From repo root:

```bash
chmod +x scripts/collect-investor-proof.sh
./scripts/collect-investor-proof.sh https://app.buildingcultureid.space
```

Output:

- `proof-bundles/investor-proof-<timestamp>.json`

## What the bundle captures automatically

- Agent card reachability and payload.
- x402 premium endpoint status.
- Trading/market health and BCC market payload.
- Pulse metrics status.
- Grove tick status and brief preview.
- **Treasury balances** (`/api/investors/treasury-balances`) — labeled Base + XRPL wallets.
- **XRPL testnet intake** (`/api/investors/xrpl-intake`) — demo rail status when configured.

## XRPL testnet proof (optional)

When `XRPL_TREASURY_INTAKE_ADDRESS` is set on testnet:

- `xrplTestnetIntake.intakeAddress` — published intake wallet
- `xrplTestnetIntake.balanceXrp` — live testnet balance
- `xrplTestnetIntake.recentPayments` — last inbound demo payments

Not an investment offer. Mainnet requires counsel — see [XRPL_TREASURY_RAIL.md](./XRPL_TREASURY_RAIL.md).

## What must be filled manually

In `manualRevenueProof`:

- `externalPaidTransactionTxHash`
- `settlementRecipientAddress`
- `settlementLogReference`
- `counterparty`
- `notes`

These fields are mandatory for investor-grade monetization proof.

## Weekly operating cadence

1. Generate one bundle at start of week.
2. Generate one bundle after any major deploy.
3. Generate one bundle after first external paid call each week.
4. Attach latest bundle link in:
   - `REA-10` (paid proof)
   - `REA-5` (reliability gate)
   - weekly update in `REA-9` (runway control)

## Acceptance criteria for paid-proof workstream

- At least one bundle with non-empty `manualRevenueProof.externalPaidTransactionTxHash`.
- Bundle confirms healthy critical endpoints (`agentCard`, `marketHealth`, `pulseMetrics`, `groveTick`).
- Settlement recipient aligns with configured treasury policy.
