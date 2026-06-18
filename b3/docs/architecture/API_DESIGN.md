# BCID API Design

REST + SIWE + attestation endpoints. Base path: `/api/bcid/`

---

## Authentication

| Level | Method | Used for |
|-------|--------|----------|
| Public read | None | resolve, catalog, scores (public fields) |
| Wallet session | SIWE cookie/header | sync, claim, bridge, recovery |
| Admin | API key + SIWE | Company BCID issuance, manual credentials |

Reuse existing SIWE middleware from `app/src/server/credentials/claim.ts`.

---

## Endpoints

### Identity

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bcid/resolve` | Public | `?did=` or `?handle=` → owner + public metadata |
| POST | `/api/bcid/sync` | SIWE | Post-mint sync from `BcidRegistry` event |
| GET | `/api/bcid/me` | SIWE | Current wallet's BCID + scores + credentials |

### Bridge

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bcid/bridge/culture` | SIWE | Link `.culture` NFT → Human BCID |

### Reputation

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bcid/{did}/scores` | Public | Builder, Trust, Contribution, Verification |
| GET | `/api/bcid/leaderboard` | Public | Top BCIDs by Builder Score |

### Credentials

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bcid/catalog` | Public | BCID credential catalog |
| GET | `/api/bcid/credentials/member` | SIWE | Eligibility + earned state |
| POST | `/api/bcid/credentials/claim` | SIWE | Idempotent credential claim |

### Recovery

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bcid/recovery/guardians` | SIWE | Set 3 guardian addresses |
| POST | `/api/bcid/recovery/initiate` | SIWE | Start recovery (new owner address) |
| POST | `/api/bcid/recovery/approve` | Guardian SIWE | Guardian approves recovery |

### GTM

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bcid/farcaster/frame` | Public | Farcaster Frame HTML for mint CTA |
| POST | `/api/bcid/waitlist/convert` | Email token | Waitlist → BCID mint invite link |
| GET | `/api/bcid/referral/{code}` | Public | Referral code validation |

### Proofs (Month 5+)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bcid/proofs/disclose` | SIWE | Submit ZK proof for access |

---

## Request/response examples

### GET `/api/bcid/resolve?did=did:bcid:human:abc123`

```json
{
  "ok": true,
  "did": "did:bcid:human:abc123",
  "type": "human",
  "ownerAddress": "0x...",
  "publicHandle": "alice",
  "tokenId": "1",
  "chainId": 84532,
  "bridgedCultureHandle": "alice.culture",
  "createdAt": "2026-06-18T00:00:00Z"
}
```

### GET `/api/bcid/{did}/scores`

```json
{
  "did": "did:bcid:human:abc123",
  "builder": 42,
  "trust": 55,
  "contribution": 38,
  "verification": 25,
  "updatedAt": "2026-06-18T12:00:00Z",
  "dimensions": {
    "builder": [{ "source": "studio_project", "weight": 30, "proofRef": "proj_123" }]
  }
}
```

### POST `/api/bcid/bridge/culture`

```json
// Request
{ "cultureHandle": "alice.culture", "cultureTokenId": "42" }

// Response
{
  "ok": true,
  "did": "did:bcid:human:abc123",
  "credentialsMigrated": 3,
  "contributionScoreSeed": 12.5
}
```

---

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `bcid_not_found` | 404 | DID/handle unknown |
| `already_bridged` | 409 | Culture token already linked |
| `not_culture_owner` | 403 | SIWE wallet ≠ culture owner |
| `bcid_already_minted` | 409 | Wallet has Human BCID |
| `database_unavailable` | 503 | Postgres unavailable |

---

## Implementation paths

| Route file | Status |
|------------|--------|
| `app/src/routes/api/bcid/resolve.ts` | Month 2 |
| `app/src/routes/api/bcid/sync.ts` | Month 2 |
| `app/src/routes/api/bcid/bridge/culture.ts` | Month 2 |
| `app/src/routes/api/bcid/scores.ts` | Month 2 |
| `app/src/routes/api/bcid/farcaster/frame.ts` | Month 3 |
| `app/src/routes/api/bcid/waitlist/convert.ts` | Month 3 |

Server logic: `app/src/server/bcid/`
