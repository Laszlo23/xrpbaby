# Security Audit — Building Culture (b3)

Application security posture for grant diligence and audit readiness. Not a penetration test report.

## Auth matrix (summary)

| Surface | Mechanism | File |
|---------|-----------|------|
| Wallet actions | SIWE (EIP-4361) | `app/src/server/platform/siwe.ts` |
| Privy sync | Bearer access token | `app/src/server/wallet/privy-auth.ts` |
| Telegram mini-app | HMAC init-data | `app/src/server/tg/init-data.ts` |
| Stripe webhooks | `constructEvent` signature | `app/src/routes/api/webhooks/stripe.tsx` |
| Growth Intelligence ingest | Bearer API key (timing-safe) | `app/src/server/growth-intelligence/auth.ts` |
| Grant agent | On-chain BCC payment verify | `app/src/server/wallet/bcc-payment-verify.ts` |
| Agent access tiers | On-chain BCC balance read | `app/src/routes/api/agents/access.tsx` |

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
```

## OWASP ASVS-lite mapping

| ASVS area | Status |
|-----------|--------|
| V2 Authentication | SIWE + Privy + webhook signatures |
| V4 Access control | Partial — public read APIs by design |
| V5 Validation | Zod + Prisma |
| V7 Error handling | Generic errors on auth failures |
| V13 API | Partial rate limits |
| V14 Config | `.env.example` + `audit:env` |

## Incident response

See root [`SECURITY.md`](../SECURITY.md).
