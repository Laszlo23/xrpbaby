# Service Deal Escrow — JSON schemas

Off-chain canonical JSON for partner/marketing service deals. Only `keccak256(canonicalJson)` is stored on-chain in `ServiceDealEscrow`.

## Canonical JSON rules

1. **UTF-8 JSON** with stable key ordering (sort object keys recursively).
2. **No insignificant whitespace** — serialize with sorted keys and no extra spaces.
3. **Lowercase addresses** — `0x` + 40 hex chars.
4. **Amounts as strings** — atomic token units (USDC = 6 decimals).
5. **ISO-8601 UTC** for timestamps (`deliverBy`).

Hash function: `metadataHash = keccak256(utf8Bytes(canonicalJson))` (same as Ethereum `keccak256`).

---

## Deal metadata schema (version 1)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | yes | Must be `1` |
| `title` | string | yes | Human-readable deal title |
| `provider` | string | yes | Service provider wallet |
| `payer` | string | yes | DAO / payer wallet |
| `payment` | object | yes | `{ token, chainId, amount }` |
| `deliverBy` | string | yes | ISO-8601 deadline for evidence |
| `deliverables` | array | yes | Weighted deliverables with KPIs |
| `evidenceRequirements` | string[] | yes | Expected evidence artifact types |

### `payment`

```json
{
  "token": "USDC",
  "chainId": 8453,
  "amount": "1000000000"
}
```

### `deliverables[]`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable slug |
| `description` | string | What the provider promises |
| `weightBps` | number | Weight 0–10000; deliverables should sum to 10000 |
| `kpis` | array | Measurable targets |

### `kpis[]`

| Field | Type | Description |
|-------|------|-------------|
| `metric` | string | e.g. `telegram_members_gained`, `wallet_connects` |
| `target` | number | Target count |
| `source` | string | e.g. `telegram_export`, `app_analytics` |

### Example

```json
{
  "deliverBy": "2026-08-01T00:00:00Z",
  "deliverables": [
    {
      "description": "Pinned post in @BuildingCulture for 7 days",
      "id": "tg-pinned-post",
      "kpis": [
        {
          "metric": "telegram_members_gained",
          "source": "telegram_export",
          "target": 200
        }
      ],
      "weightBps": 4000
    },
    {
      "description": "UTM-tracked wallet connects from campaign link",
      "id": "investor-referrals",
      "kpis": [
        {
          "metric": "wallet_connects",
          "source": "app_analytics",
          "target": 25
        }
      ],
      "weightBps": 6000
    }
  ],
  "evidenceRequirements": [
    "telegram_analytics_export",
    "utm_report",
    "post_screenshot"
  ],
  "payer": "0x0d106d512ac28cc29e625b22c6628989013c4c6b",
  "payment": {
    "amount": "1000000000",
    "chainId": 8453,
    "token": "USDC"
  },
  "provider": "0x0000000000000000000000000000000000000001",
  "title": "Telegram channel promotion — Q3 campaign",
  "version": 1
}
```

---

## Ruling JSON schema (version 1)

Submitted on-chain as `rulingHash = keccak256(canonicalRulingJson)`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | yes | Must be `1` |
| `dealMetadataHash` | string | yes | `0x` + 64 hex; must match on-chain deal |
| `dealId` | number | yes | On-chain deal id |
| `payoutBps` | number | yes | 0–10000 payout to provider |
| `evaluatedAt` | string | yes | ISO-8601 |
| `evaluator` | string | yes | `ai_oracle` or `council_override` |
| `confidence` | number | no | AI confidence 0–1 |
| `kpiResults` | array | yes | Per-KPI scores |
| `reasoning` | string | yes | Human-readable summary |

### `kpiResults[]`

| Field | Type | Description |
|-------|------|-------------|
| `deliverableId` | string | Matches deal deliverable `id` |
| `metric` | string | KPI metric name |
| `target` | number | From deal JSON |
| `actual` | number | Observed value from evidence |
| `scoreBps` | number | 0–10000 fulfillment for this KPI |
| `met` | boolean | Whether target was reached |

### Example

```json
{
  "confidence": 0.82,
  "dealId": 1,
  "dealMetadataHash": "0xabc...",
  "evaluatedAt": "2026-08-02T12:00:00Z",
  "evaluator": "ai_oracle",
  "kpiResults": [
    {
      "actual": 180,
      "deliverableId": "tg-pinned-post",
      "met": false,
      "metric": "telegram_members_gained",
      "scoreBps": 9000,
      "target": 200
    }
  ],
  "payoutBps": 6500,
  "reasoning": "Telegram growth at 90% of target; wallet connects not yet evidenced.",
  "version": 1
}
```

---

## Evidence bundle schema (version 1)

Hashed off-chain; `evidenceHash` submitted on-chain by provider.

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Must be `1` |
| `dealId` | number | On-chain deal id |
| `dealMetadataHash` | string | Must match deal |
| `submittedAt` | string | ISO-8601 |
| `submittedBy` | string | Provider wallet |
| `artifacts` | array | `{ type, uri, note? }[] |
| `metrics` | object | Key-value observed metrics |

---

## On-chain binding

| Contract field | Off-chain source |
|----------------|------------------|
| `metadataHash` | `keccak256(deal canonical JSON)` |
| `evidenceHash` | `keccak256(evidence bundle JSON)` |
| `rulingHash` | `keccak256(ruling JSON)` |
| `amount` | Must equal `payment.amount` in deal JSON |
| `provider` | Must equal `provider` in deal JSON |
| `payer` | Must equal `payer` in deal JSON |

---

## Settlement outcomes

| `payoutBps` | Provider receives | Payer receives |
|-------------|-------------------|----------------|
| 10000 | 100% | 0% |
| 6500 | 65% | 35% refund |
| 0 | 0% | 100% refund |

After AI `proposeRuling`, council has `vetoWindowSeconds` (default 72h) to `overrideRuling`. Anyone may `settle` after the window.

If no evidence by `deliverBy + deliverGraceSeconds`, payer may `refundIfExpired`.
