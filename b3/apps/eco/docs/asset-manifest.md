# Asset manifest (ogchain → ecorwa)

Source: `/Users/poker.vibe/ogchain/web/public` (+ `jagdschloss/`, `canada/`).

Target: `b3/ecorwa/public/assets/`.

## Place / storyline → `public/assets/place/`

| Folder | Role |
|--------|------|
| `bernhardsthal/` | Current Bernhardsthal photography (Hero, TwoFutures, Project) — was `public/rwa-bernhardstal/` |
| `bernhardsthal-vision/` | Vision still (e.g. `lagerhaus-new.png`) — was `public/rwa-bernhardstal-new/` |

## Properties → `public/assets/properties/<slug>/`

Naming convention:

- `<slug>-cover.*` — hero / card cover
- `<slug>-old-NN.*` — before / drift (where used)
- `<slug>-new-NN.*` — after / revive renders
- `<slug>-int-NN.*` — interiors
- `<slug>-ext-NN.*` — exteriors / context
- `<slug>-stix-NN.*` — partner STIX line (Water Side)

| Slug | Key files (renamed) |
|------|---------------------|
| `berggasse` | `berggasse-cover.jpg`, `berggasse-ext-01`–`03`, `berggasse-int-01`–`11` |
| `jagdschlossgasse-81` | `jagdschlossgasse-81-cover.jpg`, `…-int-01`–`03`, `…-new-01`–`05` |
| `whalewatching` | `whalewatching-cover.jpg`, `whalewatching-ext-01`–`05`, `whalewatching-int-01`–`03` |
| `landmark-bernhardsthal` | `landmark-bernhardsthal-cover.jpg`, `…-old-01`–`03`, `…-new-01`–`05`, `…-ext-01`–`04` |
| `altes-presshaus-katzelsdorf` | `altes-presshaus-katzelsdorf-cover.jpg`, `…-int-01`–`05` |
| `former-dept-store-bernhardsthal` | `former-dept-store-bernhardsthal-cover.jpg`, `…-ext-01`–`06` |
| `water-side-keutschach` | `water-side-keutschach-cover.png`, `…-new-01`–`03.png`, `…-ext-01.jpg` + `.jpeg`, `…-stix-01`–`05.jpg` |

## Docs → `public/assets/docs/<documentId>/`

- Copied `web/public/extracted/*` (page thumbnails).
- Local PDFs copied as `source.pdf` where the file exists under `web/public/` (see `src/lib/public-documents.ts`).
- Remote-only PDFs (4everbucket / HTTPS): `droes-plans-221219`, `land-mark-bernhardsthal-20210625`, `bau-land-kultur-20201113`, `teaser-biberstrasse-4-1010-wien`, `berggasse-brochure-en` — previews used when extracted exists; primary link is external URL in app catalog.

## Brand → `public/assets/brand/`

- `partners/0g-logo.svg`, `partners/base-logo.svg`

## PDF inventory (ogchain `web/public` root)

VKP 1169 set, Bau–Land–Kultur, Land-Mark Bernhardsthal, Water Side Keutschach, Stix EN, Bernhardsthal plans, Altes Kaufhaus, Katzelsdorf studie variants, Droeß plans (remote), Teaser Biberstraße (remote), Prä Stix A3, etc. — full list in `ogchain/web/src/lib/public-documents.ts`.
