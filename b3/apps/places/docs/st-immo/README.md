# ST-IMMO → platform building copy

Partner narratives for Building Culture are stored in TypeScript as the source of truth: [`web/src/lib/st-immo-buildings.ts`](../../web/src/lib/st-immo-buildings.ts). Raw ST-IMMO emails are **not** committed by default (optional local file below).

## Optional: raw email archive (local only)

1. Copy `source-emails.example.md` to `source-emails.md` in this directory.
2. Paste cleaned email threads into `source-emails.md` (signatures and reply chains stripped).
3. `source-emails.md` is **gitignored** — keep sensitive content out of the repo.

Use Cursor with the extraction runbook in [`EXTRACTION_RUNBOOK.md`](./EXTRACTION_RUNBOOK.md), then map output using [`PROMPT_TO_TYPESCRIPT.md`](./PROMPT_TO_TYPESCRIPT.md) before editing `ST_IMMO_BUILDINGS`.

## Files

| File | Purpose |
|------|---------|
| [`source-emails.example.md`](./source-emails.example.md) | Template for pasting emails |
| [`source-emails.md`](./source-emails.md) | Your local paste target (gitignored) |
| [`PROMPT_TO_TYPESCRIPT.md`](./PROMPT_TO_TYPESCRIPT.md) | Field mapping: prompt blocks → `StImmoBuilding` |
| [`CURRENT_BUILDINGS.md`](./CURRENT_BUILDINGS.md) | Inventory of buildings currently in code (dedupe baseline) |
| [`EXTRACTION_RUNBOOK.md`](./EXTRACTION_RUNBOOK.md) | Seven-step extraction checklist |
| [`st-immo-building.schema.json`](./st-immo-building.schema.json) | JSON Schema for validating extracted objects before TS edit |

## Disclaimer

Figures in `referenceMetrics` are illustrative until verified in issuer disclosures. Not financial advice.
