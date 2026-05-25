# Culture Pulse — social API setup

Culture Pulse uses **official APIs only** (no scraping). Toggle streams in `app/.env`.

## Farcaster (Neynar)

1. Create an app at [neynar.com](https://neynar.com).
2. Set `NEYNAR_API_KEY`.
3. Optional: `PULSE_FARCASTER_CHANNEL_ID` or `PULSE_FARCASTER_SEARCH`.

Stream is **on** when `NEYNAR_API_KEY` is set.

## X (Twitter)

1. Create a project in the [X Developer Portal](https://developer.x.com/).
2. Enable OAuth 1.0a user context with read (+ write if posting).
3. Set `X_CONSUMER_KEY`, `X_CONSUMER_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`.
4. Set `PULSE_X_USER_ID` or `PULSE_X_HANDLE`.

## Facebook

1. Create a Meta app with **Pages** product.
2. Generate a long-lived Page access token.
3. Set:

```
FACEBOOK_STREAM=true
FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=
```

## Instagram

Uses the same Meta app as Facebook (Instagram Graph API).

```
INSTAGRAM_STREAM=true
INSTAGRAM_BUSINESS_ACCOUNT_ID=
FACEBOOK_ACCESS_TOKEN=
```

## TikTok

1. Register at [TikTok for Developers](https://developers.tiktok.com/).
2. Enable Display API / video list for your account.
3. Set:

```
TIKTOK_STREAM=true
TIKTOK_ACCESS_TOKEN=
TIKTOK_OPEN_ID=
```

## Manual / curator posts

When a stream is paused, operators can add posts:

```bash
curl -X POST https://your-app/api/pulse/ingest/manual \
  -H "Content-Type: application/json" \
  -H "x-pulse-admin-secret: $PULSE_ADMIN_SECRET" \
  -d '{"content":"Weekly forest update…","url":"https://…"}'
```

## Community comments

Visible on `/signal` only (platform-native). Users sign with SIWE via the same nonce flow as `/join`.
