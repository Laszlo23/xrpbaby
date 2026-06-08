# Attribution weekly snapshot

Use this to produce investor-facing attribution proof weekly.

## Data pulls

### 1) Funnel baseline API

```bash
curl -s "https://app.buildingcultureid.space/api/platform/funnel-baseline" | jq .
```

Required in snapshot:

- last7d funnel counts:
  - `analytics:landing_view`
  - `analytics:wallet_connected`
  - `analytics:mint_clicked`
  - `analytics:mint_confirmed`
- last30d funnel counts for trend reference

### 2) Investor proof bundle

```bash
./scripts/collect-investor-proof.sh https://app.buildingcultureid.space
```

Use latest JSON from `proof-bundles/`.

### 3) Paid proof status

Include latest entries from:

- `REA-10` (paid flow proof)
- `REA-5` (reliability gate state)
- `REA-9` (runway delta)

## Weekly report block

- Week ending:
- Agent-attributed growth summary:
- Conversion trend vs previous week:
- Paid transaction count (external):
- Settlement proof reference:
- Reliability incidents:
- Runway impact:
- Next week target:

## Minimum acceptance

- Funnel baseline exported (7d + 30d).
- At least one fresh proof bundle generated this week.
- Paid-proof section updated even if outcome is zero (explicitly state blocker and owner).
