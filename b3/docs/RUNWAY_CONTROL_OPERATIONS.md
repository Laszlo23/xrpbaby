# Runway control operations

This doc operationalizes `REA-9` so runway control is executed weekly with evidence.

## Weekly workflow

1. Generate weekly report shell:

```bash
chmod +x scripts/new-runway-report.sh
./scripts/new-runway-report.sh
```

2. Fill report in `reports/runway/runway-report-<date>.md` using `docs/RUNWAY_REPORT_TEMPLATE.md`.
3. Attach latest reliability and proof artifacts:
   - `proof-bundles/investor-proof-*.json`
   - `/api/platform/funnel-baseline` snapshot
4. Post summary in:
   - `REA-9` (runway)
   - `REA-10` (revenue proof)
   - `REA-5` (reliability gate)

## Required sections every week

- Current burn by category.
- 30/60-day runway scenarios.
- Executed cuts this week.
- Revenue impact from paid lane.
- Top 3 risks + owner.

## Cost-control guardrails

- No new paid tools/SaaS unless tied to active P0 revenue/reliability work.
- Pause non-critical infra growth until paid lane repeatability exists.
- Any new spend must include:
  - objective,
  - expected ROI window,
  - owner,
  - rollback condition.

## Minimum acceptance (REA-9)

- At least one fresh runway report per week.
- At least one executed cut or explicit “no viable cut” decision with rationale.
- Weekly deltas posted:
  - burn change,
  - runway change,
  - paid revenue contribution.
