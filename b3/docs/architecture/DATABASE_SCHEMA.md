# BCID Database Schema

Prisma extensions for BCID v1. Delta from live [`app/prisma/schema.prisma`](../../app/prisma/schema.prisma).

**Migration:** `20260618180000_bcid_v1`

---

## New models

```prisma
model BcidIdentity {
  id              String   @id @default(cuid())
  did             String   @unique
  type            String   // human | company | asset | agent
  memberId        String?  @unique
  member          Member?  @relation(fields: [memberId], references: [id], onDelete: SetNull)
  ownerAddress    String
  publicHandle    String?  @unique
  tokenId         String?
  chainId         Int      @default(84532)
  displayName     String?
  metadataUri     String?
  mintedAt        DateTime?
  ownerBcidId     String?  // for agent/asset: parent Human/Company BCID
  ownerBcid       BcidIdentity?  @relation("BcidOwnership", fields: [ownerBcidId], references: [id])
  ownedBcids      BcidIdentity[] @relation("BcidOwnership")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  linkedAccounts    BcidLinkedAccount[]
  bridgeLink        BcidBridgeLink?
  credentials       BcidCredential[]
  reputationEvents  BcidReputationEvent[]
  reputationScores  BcidReputationScore?
  recoveryGuardians BcidRecoveryGuardian[]
  encryptedBlobs    BcidEncryptedBlob[]

  @@index([ownerAddress])
  @@index([type])
}

model BcidLinkedAccount {
  id             String       @id @default(cuid())
  bcidIdentityId String
  bcidIdentity   BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  platform       String       // farcaster | ens | lens | github | culture
  externalId     String?
  handle         String?
  verified       Boolean      @default(false)
  verifiedAt     DateTime?
  createdAt      DateTime     @default(now())

  @@unique([bcidIdentityId, platform])
  @@index([platform, handle])
}

model BcidBridgeLink {
  id               String       @id @default(cuid())
  bcidIdentityId   String       @unique
  bcidIdentity     BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  cultureHandle    String       @unique
  cultureTokenId   String
  cultureChainId   Int          @default(8453)
  bridgedAt        DateTime     @default(now())
  contributionSeed Float        @default(0)
}

model BcidCredential {
  id               String       @id @default(cuid())
  bcidIdentityId   String
  bcidIdentity     BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  slug             String
  status           String       @default("active")
  evidence         Json         @default("{}")
  easAttestationUid String?
  onchainTokenId   String?
  issuedAt         DateTime     @default(now())
  expiresAt        DateTime?
  revokedAt        DateTime?

  @@unique([bcidIdentityId, slug])
  @@index([slug])
}

model BcidReputationScore {
  id               String       @id @default(cuid())
  bcidIdentityId   String       @unique
  bcidIdentity     BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  builder          Float        @default(0)
  trust            Float        @default(0)
  contribution     Float        @default(0)
  verification     Float        @default(0)
  updatedAt        DateTime     @updatedAt
}

model BcidReputationEvent {
  id               String       @id @default(cuid())
  bcidIdentityId   String
  bcidIdentity     BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  scoreType        String       // builder | trust | contribution | verification
  delta            Float
  source           String
  proofRef         String?
  metadata         Json?
  createdAt        DateTime     @default(now())

  @@index([bcidIdentityId, createdAt(sort: Desc)])
  @@index([scoreType])
}

model BcidRecoveryGuardian {
  id               String       @id @default(cuid())
  bcidIdentityId   String
  bcidIdentity     BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  guardianAddress  String
  approvedAt       DateTime?
  createdAt        DateTime     @default(now())

  @@unique([bcidIdentityId, guardianAddress])
}

model BcidEncryptedBlob {
  id               String       @id @default(cuid())
  bcidIdentityId   String
  bcidIdentity     BcidIdentity @relation(fields: [bcidIdentityId], references: [id], onDelete: Cascade)
  purpose          String
  storageProvider  String
  cid              String
  contentHash      String
  schemaVersion    String       @default("1")
  createdAt        DateTime     @default(now())

  @@index([bcidIdentityId])
}

model BcidLeaderboardSnapshot {
  id         String   @id @default(cuid())
  did        String
  publicHandle String?
  builderScore Float
  rank       Int
  snapshotAt DateTime @default(now())

  @@index([snapshotAt(sort: Desc)])
  @@index([rank])
}

model BcidWaitlistInvite {
  id         String   @id @default(cuid())
  email      String   @unique
  inviteCode String   @unique
  referralCode String?
  convertedAt DateTime?
  bcidDid    String?
  createdAt  DateTime @default(now())
  expiresAt  DateTime
}
```

---

## Member relation extension

Add to existing `Member` model:

```prisma
bcidIdentity BcidIdentity?
```

---

## Unchanged legacy models

These remain for `.culture` path until sunset evaluation:

- `CultureIdentity`
- `Credential` / `UserCredential`
- `ReputationEvent` / `ReputationLeaderboardSnapshot`
- `AccessRule` (extended with BCID score fields in Month 2)

---

## Seed data

`app/prisma/seed-bcid.ts`:
- BCID credential catalog (extends 6 legacy slugs with `bcid-` prefix)
- Default access rules with `minBuilderScore`

Run: `npx tsx prisma/seed-bcid.ts`
