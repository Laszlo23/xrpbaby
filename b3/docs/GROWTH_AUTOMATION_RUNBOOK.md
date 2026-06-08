# B3 Growth Automation Runbook

This runbook covers daily growth operations for SEO, blog publishing, and Grove cross-channel distribution.

## Daily checklist

1. Publish one markdown post in `content/blog/` using frontmatter:
   - `title`, `date`, `summary`, `author`, `tags`, `seoTitle`, `seoDescription`
2. Verify feed/index:
   - `GET /blog`
   - `GET /blog/feed.xml`
   - `GET /sitemap.xml`
3. Trigger or wait for Grove tick and confirm distribution:
   - X
   - Telegram
   - Slack (ops summary)

## Command pack

From `app/`:

```bash
npm run growth:validate -- --origin=https://app.buildingcultureid.space
npm run growth:weekly-report -- --days=7
```

Optional live publish test:

```bash
npm run growth:validate -- --origin=https://app.buildingcultureid.space --run-live
```

Optional wallet path verification with zero-value self transfer:

```bash
npm run growth:validate -- --origin=https://app.buildingcultureid.space --wallet-tx
```

## Editorial calendar (default)

- Monday: Product path (`/pass`, `/join`, feature shipping updates)
- Tuesday: Forest proof (pulse, member growth, on-chain digest)
- Wednesday: BCC utility (`$BCC` pricing context, utility updates)
- Thursday: Culture story (community highlights, mission loops)
- Friday: Agent proof and recap (digest links, reliability reports)
- Weekend: Flex slot (partnerships, ecosystem explainers)

## Safety controls

Use these env flags in `app/.env`:

- `GROVE_PUBLISHING_PAUSED=1` disables all outbound publishing.
- `GROVE_DISABLE_X=1` disables X only.
- `GROVE_DISABLE_FARCASTER=1` disables Farcaster only.
- `GROVE_DISABLE_TELEGRAM=1` disables Telegram only.

Schedule profile:

- `GROVE_SCHEDULE_PROFILE=daily` for one primary daily cycle.
- `GROVE_SCHEDULE_PROFILE=legacy_4h` for 4-hour cadence.

## Distribution quality bar

Each published message should:

- include `$BCC` context data (price/liquidity/market-cap when available),
- include one canonical CTA link,
- avoid hype/speculation phrasing,
- remain under channel limits and pass voice checks.
