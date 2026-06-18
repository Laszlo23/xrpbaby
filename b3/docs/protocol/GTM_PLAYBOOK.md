# BCID GTM Playbook

Get first **100 Human BCIDs**. Month 3 launch target.

---

## Goal

| Metric | Target | Deadline |
|--------|--------|----------|
| Human BCIDs minted | 100 | End Month 3 |
| Bridge from `.culture` | 30 | End Month 3 |
| Farcaster Frame mints | 25 | End Month 3 |
| Waitlist → BCID conversion | 15% | End Month 3 |

---

## Channels

### 1. Landing page

**Route:** `/bcid` (new) + hero CTA on `/`

Copy pillars:
- "Your portable builder identity"
- "Prove work, not followers"
- "Privacy-first credentials"

Reuse [`LandingPage.tsx`](../../app/src/components/landing/LandingPage.tsx) pattern; BCID-specific hero.

### 2. Waitlist conversion

**Flow:**
```
Waitlist email → POST /api/bcid/waitlist/convert
              → Unique invite code + mint link
              → /bcid/mint?invite={code}
              → SIWE + mint
```

Incentive: Waitlist members skip queue; first 50 get 25 BCC bonus.

Existing waitlist: `POST /api/platform/waitlist` → `WaitlistEntry` Postgres.

### 3. Farcaster strategy

| Tactic | Implementation |
|--------|----------------|
| Frame mint CTA | `GET /api/bcid/farcaster/frame` |
| Cast template | "Mint your BCID — portable builder identity" + Frame link |
| Profile link | Add BCID to Farcaster bio → `/bcid/{handle}` |
| Neynar webhook | Track FID → BCID mint attribution |

Target channels: /base, /builders, /farcon community.

### 4. Community strategy

| Community | Action |
|-----------|--------|
| Telegram | Pin BCID mint link; weekly AMA |
| Discord | `#bcid` channel; role for BCID holders |
| X | Thread series on BCID vs LinkedIn/Farcaster |
| HackQuest / grants | BCID as grant applicant identity |

### 5. Referral program

| Rule | Value |
|------|-------|
| Referrer reward | 10 BCC per successful BCID mint |
| Referee reward | 5 BCC on mint |
| Cap | 5 referrals per wallet |
| Code format | `BCID-{walletShort}` |

API: `GET /api/bcid/referral/{code}` validates; mint records `referralCode`.

Requirement: referred user must complete mint (anti-sybil).

---

## Launch sequence (Month 3)

| Week | Action |
|------|--------|
| W1 | Testnet → mainnet deploy; soft launch to `.culture` holders |
| W2 | Farcaster Frame live; cast campaign |
| W3 | Waitlist conversion emails (batch 412+) |
| W4 | Referral program public; push to 100 |

---

## Messaging (vs competitors)

| vs | Message |
|----|---------|
| LinkedIn | "Credentials you can prove, not inflate" |
| Farcaster | "Identity that travels with you, not your FID" |
| ENS | "Soulbound reputation, not a sellable name" |

See [TRUST_LAYER_ANNOUNCEMENTS.md](../TRUST_LAYER_ANNOUNCEMENTS.md) for tone.

---

## Tracking

| Event | PostHog event |
|-------|---------------|
| BCID landing view | `bcid_landing_view` |
| Mint started | `bcid_mint_clicked` |
| Mint confirmed | `bcid_mint_confirmed` |
| Bridge completed | `bcid_bridge_completed` |
| Referral used | `bcid_referral_used` |
| Frame interaction | `bcid_frame_mint` |

Attribution: reuse `agent_ref` + UTM from [`analytics.ts`](../../app/src/lib/analytics.ts).

---

## Assets needed

| Asset | Status |
|-------|--------|
| BCID logo/badge | Design |
| Frame image 3:2 | Design |
| Landing `/bcid` page | Month 3 ship |
| Email template waitlist convert | Month 3 ship |
| Cast copy (3 variants) | Ready in playbook |

---

## First 100 target breakdown

| Source | Target |
|--------|--------|
| Existing `.culture` bridge | 30 |
| Farcaster Frame | 25 |
| Waitlist convert | 25 |
| Referral | 15 |
| Direct / community | 5 |

---

## Success review (Day 90)

- [ ] 100 BCIDs minted
- [ ] Builder Score computed for 100%
- [ ] ≥3 credentials claimed avg per BCID
- [ ] NPS survey sent to first 50 holders
