# Blitz 48h war room (weeks -> hours)

This is the compression protocol for urgent execution.

Goal: maximize survival and compounding growth with minimum moving parts.

## Non-negotiable rule

Do fewer things, finish them fully, ship proof, then scale.

## Hard scope freeze (next 48h)

Only three tracks are allowed:

1. **Runway control** (`REA-9`)
2. **First paid x402 transaction** (`REA-10`)
3. **Reliability gate for paid flow** (`REA-5`)

Everything else stays parked unless it directly unblocks one of the three.

## Hour-by-hour execution

### Hour 0-2: command center and numbers

- Fill `RUNWAY_REPORT_TEMPLATE.md` with rough but real values.
- Identify immediate cut-now costs (no debate, just action).
- Confirm current production endpoint health for paid path.

Deliverable:

- Posted runway snapshot (30/60-day scenarios).
- Posted endpoint health snapshot.

### Hour 2-6: first paid path proof

- Validate x402 config (`X402_PUBLIC_ORIGIN`, `PUBLIC_APP_ORIGIN`, `X402_PAY_TO`, price).
- Execute one end-to-end paid transaction.
- Capture proof:
  - request evidence
  - response evidence
  - settlement/revenue trace evidence

Deliverable:

- First paid transaction proof posted in `REA-10`.

### Hour 6-12: convert proof to buyers

- Send 3 high-intent outreach messages using `X402_BUYER_QUICKSTART.md`.
- Focus on direct integrators (not broad social spray).
- Track reply status and integration blockers.

Deliverable:

- 3 outbound messages + response status logged.

### Hour 12-24: stabilize + repeat

- Resolve any reliability breaks before additional outreach.
- Repeat paid flow with at least one external caller.
- Tighten quickstart based on real friction.

Deliverable:

- Second paid event OR clear blocker with owner and ETA.

### Hour 24-48: compounding loop

- Keep daily cadence:
  - runway update
  - reliability check
  - paid conversion attempts
- Only if stable: unlock `REA-12` for second revenue lane.

Deliverable:

- 48h war-room report with:
  - burn reduction achieved
  - paid events achieved
  - next 7-day revenue target

## Decision filter (applies to every request)

Before doing any task, ask:

1. Does it reduce burn now?
2. Does it produce paid revenue now?
3. Does it protect reliability of paid path now?

If all answers are no, defer it.

## Safety limits

- No paid growth scaling during unresolved endpoint incidents.
- No new tooling spend during runway freeze.
- No context-switching into low-impact documentation edits.

## KPI for this blitz

- **Primary:** first external paid transaction completed.
- **Secondary:** runway extended with executed cost cuts.
- **Guardrail:** paid endpoint reliability remains stable.

## End-of-day report format

- What shipped:
- Proof links:
- Burn delta:
- Paid transaction count:
- Top blocker:
- Next 12h plan:
