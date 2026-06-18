# BCID Reputation Architecture

Four verifiable reputation scores. **No vanity social scoring.**

---

## Design principles

1. **Verifiable inputs only** — every score change has a `ReputationEvent` with `proofRef`
2. **No follower weight** — Farcaster/Lens/Twitter followers excluded (explicit reject from Gitcoin Passport pattern)
3. **Independent scores** — not merged into single vanity number for gating
4. **Separate from Culture Score** — `computeBcidReputation()` in new module; legacy `culture-score.ts` unchanged
5. **Auditable** — score breakdown API returns dimension sources

---

## Four scores (0–100 each)

### Builder Score
**Question:** What have you shipped?

| Input | Weight | Proof |
|-------|--------|-------|
| Studio projects published | 30% | `StudioProject.id` |
| Onchain deploys | 25% | `ChainMintEvent.txHash` |
| Grant milestones | 25% | Grant Proof verification |
| Build task completions | 20% | `PointLedger` reason=build |

```typescript
// app/src/lib/identity/bcid-reputation.ts
builderScore = clamp(
  min(projects, 10) / 10 * 30 +
  min(deploys, 5) / 5 * 25 +
  min(grantMilestones, 3) / 3 * 25 +
  min(buildTasks, 10) / 10 * 20
)
```

### Trust Score
**Question:** How established andUtc your identity?

| Input | Weight | Proof |
|-------|--------|-------|
| BCID credentials (tier-weighted) | 40% | `BcidCredential` |
| Identity age (days) | 25% | `BcidIdentity.createdAt` |
| Recovery guardians configured | 20% | `BcidRecoveryGuardian` count ≥ 2 |
| Linked verified accounts | 15% | `BcidLinkedAccount.verified` |

**Explicitly excluded:** social follower count, Neynar score, Lens collects

### Contribution Score
**Question:** How do you participate in the ecosystem?

| Input | Weight | Cap |
|-------|--------|-----|
| Culture Points | 35% | 500 pts max contribution |
| Quest completions | 30% | 12 quests |
| Campaign participation | 20% | 5 campaigns |
| Referrals (verified) | 15% | 5 referrals |

Referrals require referred user to mint BCID (anti-sybil).

### Verification Score
**Question:** How strongly are you verified as human/entity?

| Input | Weight | Tier |
|-------|--------|------|
| Web3.bio isHuman | 25% | Tier 1 |
| World ID proof | 35% | Tier 2 |
| Video verification | 25% | Tier 3 |
| KYC proof (jurisdiction-scoped) | 15% | Tier 4 |

Tier 1 sufficient for basic access; Tier 2+ for high-trust flows (Places, treasury-adjacent).

---

## Reputation events

Extend existing `ReputationEvent` pattern:

```prisma
model BcidReputationEvent {
  id           String   @id @default(cuid())
  bcidIdentityId String
  scoreType    String   // builder | trust | contribution | verification
  delta        Float
  source       String
  proofRef     String?
  metadata     Json?
  createdAt    DateTime @default(now())
}
```

---

## Access gating

Replace unenforced `AccessRule` with BCID-aware gate:

```typescript
function checkBcidAccess(rule: AccessRule, identity: BcidIdentity, scores: BcidScores): boolean {
  if (rule.minBuilderScore && scores.builder < rule.minBuilderScore) return false;
  if (rule.requiredCredentialSlugs.length > 0) {
    // check BcidCredential holdings
  }
  return true;
}
```

Apply to: Grant Agent, Studio priority, Agent OS catalog (Month 2+).

---

## Leaderboard

- Separate from Culture Reputation leaderboard
- Route: `/bcid/leaderboard`
- Snapshot cron: `snapshotBcidLeaderboard()` — weighted by Builder Score primary
- Exclude `isRisky` wallets (Web3.bio flag)

---

## Migration from Culture Score

| Culture Score dimension | BCID mapping | Notes |
|-------------------------|--------------|-------|
| credentials | Trust | Direct |
| contributions | Contribution | Direct |
| social-trust | **Dropped** | Explicit reject |
| identity-depth | Trust (partial) | Platform count → linked accounts |
| onchain | Builder (partial) | NFT count not weighted |
| ecosystem | Contribution | Agent use count |
| leadership | Contribution | Referrals capped |
| human | Verification | Direct |

---

## Implementation files

| File | Purpose |
|------|---------|
| `app/src/lib/identity/bcid-reputation.ts` | Score computation |
| `app/src/server/reputation/bcid-events.ts` | Event append |
| `app/src/server/reputation/bcid-leaderboard.ts` | Snapshot job |
| `app/src/routes/api/bcid/scores.ts` | API endpoint |
