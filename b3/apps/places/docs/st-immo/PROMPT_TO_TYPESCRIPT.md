# Prompt output → `StImmoBuilding` mapping

Use this when translating Cursor / manual extraction into [`web/src/lib/st-immo-buildings.ts`](../../web/src/lib/st-immo-buildings.ts).

## Required fields

| Extraction block (prompt) | TypeScript field | Notes |
|---------------------------|------------------|--------|
| (generate) | `slug` | Unique kebab-case identifier, stable across edits |
| BUILDING TITLE | `buildingTitle` | Display title |
| Location | `location` | City, district, address as available |
| Type | `buildingType` | Must be **exactly** one of: `Residential`, `Mixed use`, `Landmark development`, `Adaptive reuse`, `Coastal reference programme` |
| Short Description | `shortDescription` | 1–2 sentences |
| Building Story | `buildingStory` | 4–6 sentences typical |
| Architectural Value | `architecturalValue` | Urban / cultural / design significance |
| Investment Vision | `investmentVision` | Long-term, investor-appropriate, non-promissory |

## Optional fields

| Source | TypeScript field |
|--------|------------------|
| Link to demo listing | `demoPropertyId` | `1`–`7` only when narrative matches a seeded property; omit otherwise |
| Areas, parking, € from brief | `referenceMetrics` | `{ rentalAreaM2?, terraceM2?, gardenM2?, parkingSpaces?, acquisitionEur?, grossRentEur? }` |

## Homepage / portfolio (not per-building)

| Content | Export in code |
|---------|----------------|
| Hero kicker/headline/sublines | `ST_IMMO_HOMEPAGE` |
| Land / village philosophy paragraphs | `ST_IMMO_LAND_PHILOSOPHY` |

## Demo property coverage

`getStImmoBuildingForDemoPropertyId(id)` returns the **single** `StImmoBuilding` with matching `demoPropertyId`. Only one entry per id.

- **Property 2** (Hietzing): no ST-IMMO entry today — add one only when partner briefs align.
