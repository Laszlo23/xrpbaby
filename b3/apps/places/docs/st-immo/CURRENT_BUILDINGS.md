# Current `ST_IMMO_BUILDINGS` inventory (baseline)

Merged, deduplicated view of entries in [`web/src/lib/st-immo-buildings.ts`](../../web/src/lib/st-immo-buildings.ts). Update this file when you add or remove catalog entries.

| slug | buildingTitle | demoPropertyId |
|------|---------------|----------------|
| berggasse-35 | Berggasse 35 — A Place to Call Home | 1 |
| jagdschlossgasse-81 | Jagdschlossgasse 81 | 4 |
| water-side-keutschach | Water Side — Keutschach am See | 3 |
| landmark-bernhardsthal | LandMark — Bernhardsthal | 5 |
| department-store-bernhardsthal | Historic department store — Bernhardsthal | 7 |
| altes-presshaus-katzelsdorf | Altes Presshaus — Katzelsdorf | 6 |
| alter-stadl-katzelsdorf | Alter Stadl — Katzelsdorf | — |
| whalewatching-reference | Whalewatching lodge | — |

Entries without `demoPropertyId` still appear in `ST_IMMO_BUILDINGS` but do not overlay a `/properties/{id}` page via `getStImmoBuildingForDemoPropertyId`.
