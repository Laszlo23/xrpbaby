# Security incident runbook

## 1. Suspected secret leak (keys, JWT, Strapi admin)

1. **Rotate immediately** — EVM keys, Thirdweb, Strapi `APP_KEYS` / JWT secrets, any RPC keys with spend risk.
2. **Pause** — set `AGENTS_PAUSED=1`; on-chain, `pause()` on `Pausable` contracts if threat is live.
3. **Revoke access** — Strapi admin passwords, API tokens, CI secrets.
4. **Scrub history** — if secrets were committed, use `git filter-repo` (see `SECURITY.md`).
5. **Post-mortem** — timeline, blast radius, corrective actions.

## 2. Abnormal agent / treasury activity

1. Check `AgentActionLog` in Postgres (recent rows visible on `/agent-fleet`).
2. Disable cron / worker running `@bc/agent-runtime`.
3. Verify Safe signers and pending transactions on Base — Safe `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c` (chainId 8453); see `TREASURY_POLICY.md`.

## 3. Strapi / API abuse

1. Confirm `CORS_ORIGIN` is not wildcard in production.
2. Review rate-limit logs for `/api/community-profiles/wallet/*`.
3. Temporarily block abusive IPs at the edge (CDN / nginx).

## Contacts

- Fill in on-call rotation and legal counsel contacts for your org (not committed here).
