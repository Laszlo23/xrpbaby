# Security Audit — Building Culture (b3)

Application security posture for grant diligence and audit readiness. Not a penetration test report.

## Auth matrix (summary)

| Surface | Mechanism | File |
|---------|-----------|------|
| Wallet actions (onboarding, activity, XRPL link) | SIWE + server nonce (`requireSiweAuth`) | `app/src/server/platform/siwe.ts` |
| Points / BCC payouts (weekly claim, redeem, airdrop) | SIWE + nonce (`requireSiweAuthFromMessage`) | payout routes + `app/src/lib/points-fns.ts` |
| Credential claim | SIWE + wallet binding | `app/src/routes/api/credentials/claim.tsx` |
| Privy social / checkout | Bearer + linked wallet match | `app/src/server/wallet/privy-auth.ts` |
| Privy sync | Bearer access token | `app/src/server/wallet/privy-auth.ts` |
| Telegram mini-app | HMAC init-data | `app/src/server/tg/init-data.ts` |
| Stripe webhooks | `constructEvent` signature | `app/src/routes/api/webhooks/stripe.tsx` |
| Growth Intelligence ingest | Bearer API key (timing-safe) | `app/src/server/growth-intelligence/auth.ts` |
| Growth Intelligence overview | `OPS_DASHBOARD_SECRET` (fail closed) | `app/src/routes/api/intelligence/overview.tsx` |
| Attribution dashboard | `OPS_DASHBOARD_SECRET` (fail closed) | `app/src/routes/api/platform/attribution-dashboard.tsx` |
| Internal founding / Farcaster bridge | `PLATFORM_INTERNAL_SECRET` (fail closed) | `admin-secret.ts` + internal routes |
| Elias inbound | `ELIAS_INBOUND_SECRET` (fail closed) | `app/src/routes/api/elias/inbound.tsx` |
| Grant agent | On-chain BCC payment verify | `app/src/server/wallet/bcc-payment-verify.ts` |
| Agent access tiers | On-chain BCC balance read | `app/src/routes/api/agents/access.tsx` |

## Hardening notes (2026-06)

- Client points SIWE uses `/api/platform/siwe-nonce` (not client UUID) via `usePointsSiweSign` + `buildPlatformSiweMessage`.
- `XRPL_LINK_TEST_BYPASS` is ignored when `NODE_ENV=production`.
- Admin routes return **503** when required secrets are unset (never open-by-default).
- Treasury hot-wallet payouts remain high-risk — configure payout whitelist in production `.env`.

## Rate limiting

In-memory IP buckets on high-risk write routes via `app/src/server/platform/rate-limit.ts`. **Gap:** not all `/api/*` routes covered; horizontal scale requires Redis-backed limiter.

## Input validation

- Zod schemas on POST bodies (`app/src/server/platform/schemas.ts`, route handlers)
- Prisma ORM (parameterized queries)
- JSON body size cap 16KB on rate-limited routes

## Dependency exceptions

Documented in [`SECURITY_AUDIT_EXCEPTIONS.json`](SECURITY_AUDIT_EXCEPTIONS.json). Review monthly.

## Automated gates

```bash
npm run security:scan   # npm audit + gitleaks
npm run audit:gate      # full program
cd app && npx tsx --test src/server/platform/admin-secret.test.ts src/server/platform/siwe.test.ts
```

## Findings addressed (app hardening pass)

| Severity | Issue | Status |
|----------|-------|--------|
| High | Credential claim without caller proof | Fixed — SIWE required |
| High | SIWE replay on payout/points paths | Fixed — nonce consumption |
| High | Admin routes open when secret unset | Fixed — fail closed |
| High | Privy token not bound to wallet | Fixed — `requirePrivyWalletMatch` |
| High | Weekly claim idempotency squatting | Fixed — server-derived key + wallet match on replay |
| High | Weekly claim concurrent double-spend | Fixed — wallet row lock in transaction |
| High | Weekly claim burns points off whitelist | Fixed — reject before debit; auto-rollback stale holds |
| Medium | Client SIWE used random nonce | Fixed — server nonce endpoint |
| Medium | Credential claim handle not bound to owner | Fixed — `not_culture_id_owner` check |
| Medium | XRPL test bypass in production | Fixed — prod guard |
| Medium | Undocumented internal secrets | Fixed — `.env.example` |

## OWASP ASVS-lite mapping

| ASVS area | Status |
|-----------|--------|
| V2 Authentication | SIWE + nonce + Privy wallet binding |
| V4 Access control | Admin fail-closed; credential claim gated |
| V5 Validation | Zod + Prisma |
| V7 Error handling | Generic errors on auth failures |
| V13 API | Partial rate limits |
| V14 Config | `.env.example` + `audit:env` |

## Incident response

See root [`SECURITY.md`](../SECURITY.md).
