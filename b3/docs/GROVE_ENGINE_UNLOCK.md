# Unlock the Grove growth engine

Grove is Building Culture’s proof-first marketing agent. When fully wired it:

- Posts every **4 hours** (systemd timer on the VPS)
- Publishes to **X**, **Farcaster**, and **Telegram** (when credentials exist)
- Anchors copy to live **BCC market data**, **Culture Pulse**, and **grant/RWA proof** links
- Tracks attribution via `agent_ref=grove` on every CTA

Canonical origin: `https://app.buildingcultureid.space`

---

## Current status (check anytime)

```bash
npm run grove:check
curl -s https://app.buildingcultureid.space/api/marketing/grove/tick | jq .
```

| Piece | Env vars | Your status |
|-------|----------|-------------|
| Core tick + secret | `GROVE_MARKETING_ADMIN_SECRET`, `PUBLIC_APP_ORIGIN` | ✅ Set |
| Auto-post | `GROVE_AUTO_POST=1` | ✅ Set |
| Telegram | `TELEGRAM_BOT_TOKEN`, `GROVE_TELEGRAM_CHAT_ID` | ✅ Set (posts today) |
| X / Twitter | `GROVE_X_*` (4 keys) | ❌ **Missing — unlock this** |
| Farcaster | `NEYNAR_API_KEY`, `GROVE_NEYNAR_SIGNER_UUID` | ❌ **Missing — unlock this** |
| LLM polish (optional) | `GROVE_LLM_ENABLED=1`, `OG_COMPUTE_ROUTER_API_KEY` | LLM on; 0G key optional |

**Telegram already works.** X and Farcaster are the blockers for “max exposure.”

---

## Step 1 — X (Twitter) credentials

### A. Create or use Grove account

1. Log in at [x.com](https://x.com) as **@GroveBC** (or create it).
2. Alternatively use `@buildingcultu3` temporarily via `X_*` keys (not recommended long-term).

### B. Developer portal

1. Open [developer.x.com](https://developer.x.com/en/portal/dashboard) → your project.
2. **User authentication settings** → OAuth 1.0a → enable **Read and write**.
3. Generate **Access Token and Secret** for the Grove account.
4. Copy four values into `deploy/.env`:

```bash
GROVE_X_CONSUMER_KEY=...
GROVE_X_CONSUMER_SECRET=...
GROVE_X_ACCESS_TOKEN=...
GROVE_X_ACCESS_TOKEN_SECRET=...
GROVE_X_HANDLE=GroveBC
```

### C. Test (dry run then live)

```bash
npm run sync:deploy-env
cd app && node scripts/grove-tick.mjs --dry-run --pillar grant_proof
# After deploy:
cd app && node scripts/grove-tick.mjs --pillar grant_proof
```

---

## Step 2 — Farcaster (Neynar signer)

You already have `NEYNAR_API_KEY`. You need a **managed signer** for Grove’s FID.

### A. Neynar dashboard

1. Open [dev.neynar.com](https://dev.neynar.com/) → your app.
2. **Signers** → Create managed signer (or link Grove Warpcast account).
3. Copy **Signer UUID** → `deploy/.env`:

```bash
GROVE_NEYNAR_SIGNER_UUID=...
# Optional:
GROVE_FARCASTER_CHANNEL_ID=base
GROVE_FARCASTER_FID=...
```

### B. Test cast

```bash
npm run sync:deploy-env && npm run deploy:grove
cd app && node scripts/grove-tick.mjs --pillar rwa_proof
```

---

## Step 3 — Deploy + enable timer

After editing `deploy/.env`:

```bash
npm run sync:deploy-env
npm run deploy:grove
```

`deploy-grove.sh` installs `bc-grove-tick.timer` (every 4h) on the VPS.

Manual tick (from laptop, uses production API):

```bash
cd app && node scripts/grove-tick.mjs
```

---

## Step 4 — Launch week (7 posts)

Run one pillar per day (or use the copy in `docs/GROVE_LAUNCH_POSTS.md` manually):

```bash
cd app
node scripts/grove-tick.mjs --pillar rwa_proof      # Day 1
node scripts/grove-tick.mjs --pillar grant_proof    # Day 2
node scripts/grove-tick.mjs --pillar forest_proof   # Day 3
node scripts/grove-tick.mjs --pillar product_path   # Day 4
node scripts/grove-tick.mjs --pillar bcc_utility    # Day 5
node scripts/grove-tick.mjs --pillar agent_proof    # Day 6
node scripts/grove-tick.mjs --pillar culture_story  # Day 7
```

Add `--dry-run` to preview without publishing.

---

## Step 5 — Pulse + attestation (credibility loop)

These jobs make Grove posts cite **real numbers**:

```bash
# On VPS cron or locally against production DB:
npm run pulse:ingest    # every 15m
npm run pulse:attest    # daily 00:05 UTC
```

After attestation tx, force an attestation post:

```bash
cd app && node scripts/grove-tick.mjs --pillar attestation
```

---

## Kill switches

| Situation | Action |
|-----------|--------|
| Bad deploy / smoke fail | `GROVE_AUTO_POST=0` → redeploy |
| Pause all agents | `AGENTS_PAUSED=1` or `GROVE_PUBLISHING_PAUSED=1` |
| X only off | `GROVE_DISABLE_X=1` |
| Farcaster only off | `GROVE_DISABLE_FARCASTER=1` |

---

## Full env reference

See `deploy/.env.example` (Grove section) and `docs/ON_CHAIN_MARKETING_AGENT.md`.
