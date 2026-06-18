-- BCID v1 parallel identity standard

CREATE TABLE "BcidIdentity" (
    "id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'human',
    "memberId" TEXT,
    "ownerAddress" TEXT NOT NULL,
    "publicHandle" TEXT,
    "tokenId" TEXT,
    "chainId" INTEGER NOT NULL DEFAULT 84532,
    "displayName" TEXT,
    "metadataUri" TEXT,
    "mintedAt" TIMESTAMP(3),
    "ownerBcidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BcidIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidLinkedAccount" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT,
    "handle" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BcidLinkedAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidBridgeLink" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "cultureHandle" TEXT NOT NULL,
    "cultureTokenId" TEXT NOT NULL,
    "cultureChainId" INTEGER NOT NULL DEFAULT 8453,
    "bridgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contributionSeed" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "BcidBridgeLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidCredential" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "easAttestationUid" TEXT,
    "onchainTokenId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "BcidCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidReputationScore" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "builder" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trust" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verification" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BcidReputationScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidReputationEvent" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "scoreType" TEXT NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "proofRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BcidReputationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidRecoveryGuardian" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "guardianAddress" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BcidRecoveryGuardian_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidEncryptedBlob" (
    "id" TEXT NOT NULL,
    "bcidIdentityId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL DEFAULT '1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BcidEncryptedBlob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidLeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "publicHandle" TEXT,
    "builderScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BcidLeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BcidWaitlistInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "referralCode" TEXT,
    "convertedAt" TIMESTAMP(3),
    "bcidDid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BcidWaitlistInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BcidIdentity_did_key" ON "BcidIdentity"("did");
CREATE UNIQUE INDEX "BcidIdentity_memberId_key" ON "BcidIdentity"("memberId");
CREATE UNIQUE INDEX "BcidIdentity_publicHandle_key" ON "BcidIdentity"("publicHandle");
CREATE INDEX "BcidIdentity_ownerAddress_idx" ON "BcidIdentity"("ownerAddress");
CREATE INDEX "BcidIdentity_type_idx" ON "BcidIdentity"("type");

CREATE UNIQUE INDEX "BcidLinkedAccount_bcidIdentityId_platform_key" ON "BcidLinkedAccount"("bcidIdentityId", "platform");
CREATE INDEX "BcidLinkedAccount_platform_handle_idx" ON "BcidLinkedAccount"("platform", "handle");

CREATE UNIQUE INDEX "BcidBridgeLink_bcidIdentityId_key" ON "BcidBridgeLink"("bcidIdentityId");
CREATE UNIQUE INDEX "BcidBridgeLink_cultureHandle_key" ON "BcidBridgeLink"("cultureHandle");

CREATE UNIQUE INDEX "BcidCredential_bcidIdentityId_slug_key" ON "BcidCredential"("bcidIdentityId", "slug");
CREATE INDEX "BcidCredential_slug_idx" ON "BcidCredential"("slug");

CREATE UNIQUE INDEX "BcidReputationScore_bcidIdentityId_key" ON "BcidReputationScore"("bcidIdentityId");

CREATE INDEX "BcidReputationEvent_bcidIdentityId_createdAt_idx" ON "BcidReputationEvent"("bcidIdentityId", "createdAt" DESC);
CREATE INDEX "BcidReputationEvent_scoreType_idx" ON "BcidReputationEvent"("scoreType");

CREATE UNIQUE INDEX "BcidRecoveryGuardian_bcidIdentityId_guardianAddress_key" ON "BcidRecoveryGuardian"("bcidIdentityId", "guardianAddress");

CREATE INDEX "BcidEncryptedBlob_bcidIdentityId_idx" ON "BcidEncryptedBlob"("bcidIdentityId");

CREATE INDEX "BcidLeaderboardSnapshot_snapshotAt_idx" ON "BcidLeaderboardSnapshot"("snapshotAt" DESC);
CREATE INDEX "BcidLeaderboardSnapshot_rank_idx" ON "BcidLeaderboardSnapshot"("rank");

CREATE UNIQUE INDEX "BcidWaitlistInvite_email_key" ON "BcidWaitlistInvite"("email");
CREATE UNIQUE INDEX "BcidWaitlistInvite_inviteCode_key" ON "BcidWaitlistInvite"("inviteCode");

ALTER TABLE "BcidIdentity" ADD CONSTRAINT "BcidIdentity_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BcidIdentity" ADD CONSTRAINT "BcidIdentity_ownerBcidId_fkey" FOREIGN KEY ("ownerBcidId") REFERENCES "BcidIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BcidLinkedAccount" ADD CONSTRAINT "BcidLinkedAccount_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BcidBridgeLink" ADD CONSTRAINT "BcidBridgeLink_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BcidCredential" ADD CONSTRAINT "BcidCredential_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BcidReputationScore" ADD CONSTRAINT "BcidReputationScore_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BcidReputationEvent" ADD CONSTRAINT "BcidReputationEvent_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BcidRecoveryGuardian" ADD CONSTRAINT "BcidRecoveryGuardian_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BcidEncryptedBlob" ADD CONSTRAINT "BcidEncryptedBlob_bcidIdentityId_fkey" FOREIGN KEY ("bcidIdentityId") REFERENCES "BcidIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
