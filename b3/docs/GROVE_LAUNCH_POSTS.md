# Grove launch week — 7 proof-first posts

Use after X + Farcaster credentials are set (Telegram works immediately).

**Attribution:** every link includes `agent_ref=grove`.

**Run automated copy:**

```bash
cd app
node scripts/grove-tick.mjs --pillar <pillar>    # live
node scripts/grove-tick.mjs --pillar <pillar> --dry-run
```

---

## Day 1 — `rwa_proof` (headline wedge)

**Pillar:** fractional real estate + live REOC metadata

**X / Farcaster angle:** 8 ST-IMMO shares on Base; wallets resolve metadata to inspectable JSON.

**CTA:** `https://app.buildingcultureid.space/places?agent_ref=grove`

**Manual X draft (if posting by hand):**

```
$BCC on Base · 8 ST-IMMO property shares minted (OG1–OG8).

Token metadata → live REOC JSON — verify, don't trust a deck.

Explore → https://app.buildingcultureid.space/places?agent_ref=grove
REOC OG1 → https://app.buildingcultureid.space/places/api/reoc/1
```

---

## Day 2 — `grant_proof` (credibility)

**CTA:** `https://app.buildingcultureid.space/grant-proof?agent_ref=grove`

**Manual X draft:**

```
Shipped on Base — identity, BCC, Places RWA, Culture Points → BCC redeem.

Public verifier: 42 automated checks, inspectable contracts.

Verify → https://app.buildingcultureid.space/grant-proof?agent_ref=grove
Plan → https://app.buildingcultureid.space/plan?agent_ref=grove
```

---

## Day 3 — `forest_proof` (daily pulse)

**CTA:** `https://app.buildingcultureid.space/signal?agent_ref=grove`

Grove auto-fills member count, 24h activity, BCC liquidity from live APIs.

---

## Day 4 — `product_path` (.culture pass)

**CTA:** `https://app.buildingcultureid.space/pass?agent_ref=grove`

---

## Day 5 — `bcc_utility` (community credits)

**CTA:** `https://app.buildingcultureid.space/join?agent_ref=grove`

Message: BCC = community credits, 11.11% off passes and art.

---

## Day 6 — `agent_proof` (Grove + 0G)

**CTAs:** `/0g/agentid`, pulse digest URL

Message: Grove is agent #3; proof-first growth, not hype bots.

---

## Day 7 — `culture_story` (narrative)

**CTA:** `https://app.buildingcultureid.space/join?agent_ref=grove`

Forest metaphor — seedling → grove; community first.

---

## After launch week

Let the **4h timer** rotate pillars automatically, or set `GROVE_SCHEDULE_PROFILE=daily` for one post/day.

Weekly: re-run `npm run grant:proof` and post `grant_proof` when verifier score improves.
