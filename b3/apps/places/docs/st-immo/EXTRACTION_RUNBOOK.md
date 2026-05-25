# Seven-step extraction runbook

Apply when processing raw emails (see [`README.md`](./README.md)).

1. **Detect buildings** — List each unique project or address; merge threads that describe the same asset.
2. **Strip noise** — Remove signatures, greetings, forwards, contacts, duplicate paragraphs.
3. **Extract core data** — Title, location, type, short description, story, architectural value, investment vision; optional year, architect, m², stage.
4. **Rewrite** — Premium architecture + investment tone; no email voice; concise, verifiable where possible.
5. **Deduplicate** — One final block per building.
6. **Validate shape** — Check objects against [`st-immo-building.schema.json`](./st-immo-building.schema.json).
7. **Map to TypeScript** — Follow [`PROMPT_TO_TYPESCRIPT.md`](./PROMPT_TO_TYPESCRIPT.md); append or edit objects in `ST_IMMO_BUILDINGS`; run `npm run build` in `web/`.

After changes, refresh [`CURRENT_BUILDINGS.md`](./CURRENT_BUILDINGS.md).
