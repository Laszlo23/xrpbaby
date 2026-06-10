# Grant submission runbook

Operational checklist for non-dilutive capital. Copy blocks live in [SUBMISSION_COPY_PASTE.md](./SUBMISSION_COPY_PASTE.md). Log every submission in [proof-bundles/submission-log.txt](../proof-bundles/submission-log.txt).

## Before each submission

1. Run `cd app && npm run grant:proof` (or `npm run grant:verify` for full gates).
2. Attach latest `proof-bundles/grant-verification-*.md` + matching JSON.
3. Confirm live URLs: `/grant-proof`, `/plan`, `/0g/agentid`.

## Priority queue

| Priority | Program | Action | Copy source |
|----------|---------|--------|-------------|
| P1 | 0G Guild Hall | Post at hall.0g.ai → Guild on 0G 2.0 | SUBMISSION_COPY_PASTE § B |
| P1 | 0G Guild Apply | guild.0gfoundation.ai/apply | SUBMISSION_COPY_PASTE § C |
| P2 | Grove X / Farcaster | Set `GROVE_X_*` + `GROVE_NEYNAR_SIGNER_UUID` in deploy/.env, redeploy | deploy/.env.example |
| P2 | Talent Weekly Rewards | Post build update with `/grant-proof` link | SUBMISSION_COPY_PASTE § E |

## Grove activation (clears grant WARNs)

```bash
# In deploy/.env (never commit secrets):
GROVE_X_CONSUMER_KEY=
GROVE_X_CONSUMER_SECRET=
GROVE_X_ACCESS_TOKEN=
GROVE_X_ACCESS_TOKEN_SECRET=
GROVE_NEYNAR_SIGNER_UUID=
GROVE_AUTO_POST=1
```

Redeploy web stack, then verify at `/grant-proof` — Grove X and Farcaster rows should pass.

## Payout wallet (grants only)

`0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22` (Base) — laszlo.bihary@gmail.com
