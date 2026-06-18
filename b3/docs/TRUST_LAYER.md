# Building Culture Trust Layer

Canonical flow:

**Culture ID → Credentials → Reputation → Access → Agents → Economy**

## Positioning

- **Base** — live social and onchain execution layer (`.culture` names, Agent OS, BCC settlement today).
- **BCC** — chain-agnostic economic layer (unchanged).
- **XRPL** — optional trust/payment rail under Culture ID. Phase 2: verified wallet link (Crossmark + manual sign). Phase 3: testnet treasury intake on `/investors` (see [XRPL_TREASURY_RAIL.md](./XRPL_TREASURY_RAIL.md)). Mainnet deferred.

Building Culture is **not** an XRP project. XRPL is infrastructure, not the brand story.

## Routes

| Route | Purpose |
| ----- | ------- |
| `/credentials` | Credential Center catalog |
| `/id/{handle}/credentials` | Per-identity earned + eligible credentials |
| `/id/{handle}/reputation` | Culture Reputation score + timeline |
| `/credentials/leaderboard` | Top claimed `.culture` identities |
| `GET /api/credentials/catalog` | JSON catalog |
| `GET /api/credentials/member` | Eligibility + earned state |
| `POST /api/credentials/claim` | Idempotent credential claim |
| `GET /api/credentials/xrpl/challenge` | Deprecated — use POST with SIWE |
| `POST /api/credentials/xrpl/challenge` | XRPL link nonce (SIWE-gated) |
| `POST /api/credentials/xrpl/link` | Verify + store linked XRPL address |
| `POST /api/credentials/identity/sync` | Upsert CultureIdentity after mint (SIWE) |
| `/investors` | Published treasury wallets + live balances |
| `GET /api/investors/treasury-balances` | Labeled wallet balances (Base + XRPL) |
| `GET /api/investors/xrpl-intake` | XRPL testnet intake status |

## Credential types

1. **Builder** — Studio / build tasks
2. **Contributor** — Culture Points / quests
3. **Community Leader** — referrals / founding tier
4. **Verified Human** — Web3.bio isHuman attestations
5. **Trusted Agent** — BC-issued (Limx, ERC-8004)
6. **Verified Project** — Grant Proof / BC review

## Database

See `app/prisma/schema.prisma` models: `CultureIdentity`, `LinkedWallet`, `Credential`, `CredentialIssuer`, `UserCredential`, `ReputationEvent`, `AccessRule`, `AgentIdentity`.

Seed: `npx tsx prisma/seed-credentials.ts`

## Culture Reputation

Evolved from Culture Score (`computeCultureScore` / alias `computeCultureReputation`). Weights favor credentials and contributions over vanity metrics.

## Community narrative

See [TRUST_LAYER_ANNOUNCEMENTS.md](./TRUST_LAYER_ANNOUNCEMENTS.md).
