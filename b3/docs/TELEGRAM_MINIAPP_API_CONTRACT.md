# Telegram Mini App API contract (gamified + learning-first)

This contract is designed for fast implementation while preserving security, retention, and compounding growth.

## Design principles

- **Security first:** every privileged Telegram request requires validated init data.
- **One identity:** Telegram user maps to one ecosystem member profile.
- **Learning before risk:** XRP starts as quote simulation and education, then unlocks execution later.
- **Gamification with utility:** users earn points and progression, not speculative promises.

## Auth model

Client sends Telegram init data in header:

```text
Authorization: tma <init_data>
```

Server validates signature + expiration (`<= 3600s`) before any protected action.

## Endpoint contract

### 1) `POST /api/tg/auth`

Creates/refreshes Telegram miniapp session after init-data validation.

Request:

```json
{
  "initDataRaw": "<optional if already in Authorization header>"
}
```

Response `200`:

```json
{
  "ok": true,
  "member": {
    "id": "mem_123",
    "walletAddress": "0x...",
    "telegramUserId": "123456789"
  },
  "session": {
    "expiresAt": "2026-06-10T10:00:00.000Z"
  },
  "progression": {
    "level": 1,
    "xp": 40,
    "nextLevelXp": 100
  }
}
```

Errors:

- `401` invalid/expired init data
- `429` rate-limited
- `500` server error

---

### 2) `GET /api/tg/me`

Returns Telegram-specific profile state for miniapp UI hydration.

Headers:

- `Authorization: tma <init_data>`

Response `200`:

```json
{
  "member": {
    "id": "mem_123",
    "displayName": "Laszlo",
    "walletAddress": "0x..."
  },
  "wallets": {
    "tonConnected": true,
    "evmConnected": true
  },
  "gamification": {
    "level": 2,
    "xp": 180,
    "streakDays": 3,
    "badges": ["telegram_pioneer", "first_quote"]
  }
}
```

---

### 3) `GET /api/tg/quests`

Returns current quests for growth and education loops.

Headers:

- `Authorization: tma <init_data>`

Response `200`:

```json
{
  "quests": [
    {
      "id": "q_tg_connect_wallet",
      "type": "onboarding",
      "title": "Connect TON wallet",
      "xpReward": 50,
      "status": "available"
    },
    {
      "id": "q_xrp_learn_1",
      "type": "learning",
      "title": "Complete XRP liquidity lesson",
      "xpReward": 40,
      "status": "available"
    },
    {
      "id": "q_tg_gratitude_1",
      "type": "community",
      "title": "Send gratitude to a contributor",
      "xpReward": 35,
      "status": "locked"
    }
  ]
}
```

---

### 4) `POST /api/tg/quests/claim`

Claims quest rewards after server-side verification.

Request:

```json
{
  "questId": "q_tg_connect_wallet"
}
```

Response `200`:

```json
{
  "ok": true,
  "xpGranted": 50,
  "newLevel": 2,
  "unlocked": ["xrp_quote_simulator"]
}
```

Rules:

- Idempotent by `memberId + questId`.
- Never trust client-only completion.

---

### 5) `GET /api/market/xrp-quote`

XRP route/quote endpoint for phase A (quote-only, no execution).

Query:

- `base` (required, e.g. `XRP`)
- `quote` (required, e.g. `USDC`)
- `amount` (required)
- `mode` (optional: `learn` | `live`, default `learn`)

Response `200`:

```json
{
  "mode": "learn",
  "executionEnabled": false,
  "quote": {
    "price": "0.5231",
    "estimatedOutput": "52.31",
    "slippageBps": 50
  },
  "liquidity": {
    "source": "xrpl_orderbook",
    "depthScore": 0.74
  },
  "learningHint": "High slippage appears when depth is thin. Try lower size."
}
```

Errors:

- `400` invalid pair/amount
- `503` data source unavailable (fallback path should be shown)

---

### 6) `GET /api/tg/learn/modules`

Returns learning modules tied to user progression and safer trading behavior.

Response `200`:

```json
{
  "modules": [
    {
      "id": "m_xrp_liquidity_basics",
      "title": "XRP liquidity basics",
      "durationMin": 4,
      "xpReward": 30,
      "status": "available"
    },
    {
      "id": "m_ton_wallet_safety",
      "title": "TON wallet safety",
      "durationMin": 3,
      "xpReward": 30,
      "status": "locked"
    },
    {
      "id": "m_gratitude_support_loop",
      "title": "Gratitude loop: support, educate, create",
      "durationMin": 2,
      "xpReward": 25,
      "status": "available"
    }
  ]
}
```

---

### 7) `POST /api/tg/learn/complete`

Marks a learning module complete and grants XP only after required checks.

Request:

```json
{
  "moduleId": "m_gratitude_support_loop",
  "proof": {
    "quizScore": 80,
    "gratitudeType": "support",
    "gratitudeNote": "Thank you for helping new members get started safely."
  }
}
```

Response `200`:

```json
{
  "ok": true,
  "xpGranted": 25,
  "nextRecommendedModuleId": null
}
```

## Anti-abuse + safety requirements

- Rate limit all `/api/tg/*` endpoints.
- Add replay protection for quest claims.
- Keep `XRPL_EXECUTION_ENABLED=0` until explicit treasury/risk approval.
- Add audit logs for:
  - auth failures
  - quest claims
  - quote requests
  - module completions

## Analytics events (minimum)

- `tg_auth_success`
- `tg_wallet_connected_ton`
- `tg_quest_claimed`
- `tg_xrp_quote_requested`
- `tg_learning_module_completed`
- `tg_gratitude_sent`
- `tg_paid_action_started`

These should include `agent_ref`, `utm_source`, `utm_medium`, `utm_campaign` when present.
