# Telegram Mini App implementation checklist (file-by-file)

Use this with `REA-15`, `REA-13`, `REA-14`, and `REA-16`.

## Phase 1 — secure auth foundation (`REA-15`)

### Backend

- [ ] Create `app/src/routes/api/tg/auth.tsx`
  - Validate Telegram init data (`Authorization: tma <init_data>`)
  - Return session + progression payload
- [ ] Create `app/src/routes/api/tg/me.tsx`
  - Return miniapp profile + wallet + gamification state
- [ ] Create `app/src/server/tg/validate-init-data.ts`
  - Shared validation utility (signature + expiration)
- [ ] Create `app/src/server/tg/parse-init-data.ts`
  - Parse user payload safely and consistently
- [ ] Create `app/src/server/tg/member-sync.ts`
  - Map Telegram identity to existing member model

### Security

- [ ] Add rate limiter for `/api/tg/*`
- [ ] Add structured auth failure logs
- [ ] Add replay-protection strategy note in code comments

## Phase 2 — TON wallet + first tx proof (`REA-13`)

### Frontend

- [ ] Create `app/src/routes/tg/index.tsx`
  - Telegram miniapp shell
- [ ] Create `app/src/components/tg/TonConnectCard.tsx`
  - Connect state + wallet status
- [ ] Create `app/src/components/tg/ProgressCard.tsx`
  - XP, level, streak, next unlock

### TON integration

- [ ] Add TON Connect provider wiring (where app wallet providers are initialized)
- [ ] Add one low-risk send transaction path
- [ ] Add clear user messages for reject/timeout/failure

### Proof

- [ ] Record first successful TON tx proof in `REA-13`

## Phase 3 — XRP quote-only lane (`REA-14`)

### Backend

- [ ] Create `app/src/routes/api/market/xrp-quote.tsx`
  - Quote-only endpoint (`XRPL_EXECUTION_ENABLED=0`)
- [ ] Create `app/src/server/xrp/quote-service.ts`
  - XRPL orderbook/quote adapter
- [ ] Create `app/src/server/xrp/risk-guards.ts`
  - Mode checks, rate limits, safe defaults

### Frontend

- [ ] Create `app/src/components/tg/XrpQuoteCard.tsx`
  - Quote display + slippage + depth signal
- [ ] Add `learn` mode UI labels (not execution)
- [ ] Add learning hint blocks for safer behavior

## Phase 4 — gamified learning loop (`REA-16`)

### Backend

- [ ] Create `app/src/routes/api/tg/quests.tsx`
- [ ] Create `app/src/routes/api/tg/quests/claim.tsx`
- [ ] Create `app/src/routes/api/tg/learn/modules.tsx`
- [ ] Create `app/src/routes/api/tg/learn/complete.tsx`
- [ ] Create `app/src/server/tg/gamification-service.ts`
  - XP, level, streak, badge progression
- [ ] Create `app/src/server/tg/learning-service.ts`
  - Module unlocks and completion checks

### Frontend

- [ ] Create `app/src/components/tg/QuestList.tsx`
- [ ] Create `app/src/components/tg/LearningModules.tsx`
- [ ] Create `app/src/components/tg/BadgeShelf.tsx`

### Product rules

- [ ] Reward learning and verified actions, not speculation
- [ ] Keep quests short (2-5 min) and stackable
- [ ] Show "why this matters" hints for each module

## Analytics + observability

- [ ] Add Telegram event constants in analytics layer
- [ ] Track:
  - `tg_auth_success`
  - `tg_wallet_connected_ton`
  - `tg_quest_claimed`
  - `tg_xrp_quote_requested`
  - `tg_learning_module_completed`
- [ ] Add dashboard slice for Telegram conversion funnel
- [ ] Add endpoint health checks for `/api/tg/*` and `/api/market/xrp-quote`

## Environment checklist

- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `TELEGRAM_MINIAPP_URL`
- [ ] `TELEGRAM_INITDATA_MAX_AGE_SEC=3600`
- [ ] `VITE_TONCONNECT_MANIFEST_URL`
- [ ] `VITE_TON_NETWORK`
- [ ] `XRPL_RPC_URL`
- [ ] `XRPL_QUOTE_ENABLED=1`
- [ ] `XRPL_EXECUTION_ENABLED=0`

## Launch readiness gates

- [ ] Gate 1: Telegram auth security tests pass
- [ ] Gate 2: TON connect + first tx proof captured
- [ ] Gate 3: XRP quote lane stable under load
- [ ] Gate 4: Quest + learning loop active
- [ ] Gate 5: Controlled audience rollout complete

## Compounding growth loop (daily)

1. Reliability check
2. Learning completions check
3. Quest completion and wallet connect conversion review
4. Quote demand review
5. One improvement shipped
