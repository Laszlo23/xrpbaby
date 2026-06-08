# Auto-Traffic Strategy (Investor-Ready Growth)

Canonical public origin: `https://app.buildingcultureid.space`

This strategy is built to do two things at once:

1. Keep the product visibly alive every day.
2. Convert that activity into measurable investor-facing growth.

## 1) Growth engine (what runs automatically)

- **Pulse ingest (every 15m):** refreshes social + platform signals.
- **Grove marketing tick (every 4h):** generates and publishes proof-first posts.
- **Daily on-chain attestation (00:05 UTC):** records daily digest proof on Base.
- **Investor proof bundle (daily):** captures health + growth artifacts for diligence.

Existing scripts:

- `npm run pulse:ingest`
- `npm run grove:tick`
- `npm run pulse:attest`
- `./scripts/collect-investor-proof.sh "https://app.buildingcultureid.space"`

## 2) Channel mix (automatic distribution)

- **X + Farcaster (Grove):** proof-linked updates with one CTA per post.
- **In-app surfaces:** `/signal`, `/investors`, `/places`, `/mission`.
- **On-chain proof loop:** attest digest first, then post with attestation context.

Reference implementation and voice constraints:

- `docs/ON_CHAIN_MARKETING_AGENT.md`
- `docs/PLATFORM_VOICE.md`

## 3) Conversion path (single dominant CTA)

Keep the first decision simple:

- **Primary CTA:** `Invest now` -> `/places`
- **Secondary CTA:** `Investor materials` -> `/investors`
- **Trust CTA:** `Transparency` -> `/docs`

## 4) KPI board (weekly review)

- **Traffic**
  - Sessions to `/places`
  - Sessions to `/investors`
  - Click-through from Grove links (`agent_ref=grove`)
- **Activation**
  - Wallet connect rate
  - Join/pass starts from investor pages
- **Health**
  - `/api/market/health` success rate
  - `/api/trading/health` success rate
  - Grove tick success rate
- **Proof**
  - Daily digest attested: yes/no
  - Investor bundle generated: yes/no

## 5) Daily operator checklist (15 minutes)

```bash
cd /Users/poker.vibe/xrpbaby/b3
STRICT_SMOKE=1 ./scripts/production-smoke.sh "https://app.buildingcultureid.space"
curl -s https://app.buildingcultureid.space/api/market/health | jq .
curl -s https://app.buildingcultureid.space/api/trading/health | jq .
curl -s https://app.buildingcultureid.space/api/marketing/grove/tick | jq .
./scripts/collect-investor-proof.sh "https://app.buildingcultureid.space"
```

If any health check fails, pause auto-posting (`GROVE_AUTO_POST=0`) until reliability is green.

## 6) Go-live configuration

Set in production `app/.env`:

```bash
PUBLIC_APP_ORIGIN=https://app.buildingcultureid.space
GROVE_AUTO_POST=1
GROVE_MARKETING_ADMIN_SECRET=<secret>
```

Optional for external Places links:

```bash
VITE_PLACES_SITE_URL=https://places.buildingcultureid.space
VITE_PLACES_INVEST_PATH=/investors
VITE_PLACES_TRADE_PATH=/marketplace
VITE_PLACES_TRANSPARENCY_PATH=/docs
```

## 7) Rollback rule

If market/trading health or smoke checks fail:

1. Set `GROVE_AUTO_POST=0`.
2. Redeploy last known-good release.
3. Re-run smoke and health checks.
4. Re-enable posting only after all checks pass.
