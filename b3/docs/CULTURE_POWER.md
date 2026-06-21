# Culture Power — BCC farming hashrate (Phase 1)

Culture Power is your **active farming quotient** for weekly BCC claims. It runs parallel to **Culture Score** (slow reputation on profiles). Think of Power as hashrate: maintain it daily, stack stake + LP + burns, and your weekly Culture Points → BCC conversion multiplies.

## Narrative

The **Culture Reactor** on `/profile` shows live Power (0–1000) and your effective weekly multiplier (0.8×–2.0× in Phase 1). Idle wallets decay; daily rituals heat the reactor back up.

## Formula (v1)

```
effectiveMultiplierBps = clamp(
  baseActivation × stakeTier × lpTier × burnTier × streakMult,
  min=8000, max=20000
)
```

| Input | Source |
|-------|--------|
| **Activation** | Daily check-in, Well spin, or quest completion (decays −5%/UTC day idle) |
| **Stake** | Culture Roots pool tier (reuses `STAKING_BOOST_BPS`: 1.0× / 1.15× / 1.25×) |
| **LP** | Aerodrome BCC LP or Balancer BPT proof — tiers by position size (max balance wins) |
| **Burn** | Rolling 30d `MemberPowerProof` rows (`bcc_burn` kind) |
| **Streak** | +2% per consecutive maintenance day, cap 7 days |

Weekly claim uses `applyPowerMultiplier(baseBccWei, effectiveBps)` when Power is enabled — replacing the legacy staking-only boost path.

## Enable

```bash
CULTURE_POWER_ENABLED=1
VITE_CULTURE_POWER_ENABLED=1
```

Optional tuning:

| Env | Default | Purpose |
|-----|---------|---------|
| `CULTURE_POWER_MAX_BPS` | `20000` | Cap multiplier (2.0×) |
| `CULTURE_POWER_DECAY_BPS_PER_DAY` | `500` | Idle decay per UTC day |

## APIs

| Route | Purpose |
|-------|---------|
| `GET /api/member/culture-power?address=` | Score, multiplier, dimensions, maintenance hint |
| `POST /api/member/culture-power/refresh` | SIWE force recompute after stake/LP |

## Database

- `MemberPowerState` — cached score, streak, last maintenance
- `MemberPowerProof` — LP / burn proof rows

Migration: `20260619010000_member_culture_power`

## Tasks

| Slug | Trigger | CP |
|------|---------|-----|
| `power-daily-maintenance` | Any maintenance refresh | 5 |
| `power-streak-7` | 7-day streak | 35 |
| `power-reactor-max` | Power ≥ 900 once | 50 |

## Treasury safety

Power only **multiplies** existing CP → BCC conversion. No new inflation; payouts remain treasury-funded and whitelist-gated.

## Phase 2+ (not built)

- Per-community token Power configs
- On-chain Power registry / merkle multipliers
- Streaming micro-accrual between weekly claims
