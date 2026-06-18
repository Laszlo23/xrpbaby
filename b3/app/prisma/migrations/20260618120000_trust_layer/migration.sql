-- Trust layer: CultureIdentity, credentials, reputation, access, agents

CREATE TABLE "CultureIdentity" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "handle" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "tokenId" TEXT,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "mintedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CultureIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LinkedWallet" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'siwe',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedWallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CredentialIssuer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "did" TEXT,
    "walletAddress" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialIssuer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "metadataSchema" JSONB NOT NULL DEFAULT '{}',
    "earnRules" JSONB NOT NULL DEFAULT '{}',
    "unlocks" JSONB NOT NULL DEFAULT '[]',
    "xrplMapping" JSONB,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserCredential" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "identityId" TEXT,
    "agentIdentityId" TEXT,
    "memberId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "xrplCredentialHash" TEXT,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "proofRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessRule" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "minReputation" DOUBLE PRECISION,
    "requiredCredentialSlugs" TEXT[],
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentIdentity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "agentCardUrl" TEXT,
    "cultureIdentityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReputationLeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationLeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CultureIdentity_memberId_key" ON "CultureIdentity"("memberId");
CREATE UNIQUE INDEX "CultureIdentity_handle_key" ON "CultureIdentity"("handle");
CREATE INDEX "CultureIdentity_ownerAddress_idx" ON "CultureIdentity"("ownerAddress");

CREATE UNIQUE INDEX "LinkedWallet_chain_address_key" ON "LinkedWallet"("chain", "address");
CREATE INDEX "LinkedWallet_identityId_idx" ON "LinkedWallet"("identityId");

CREATE UNIQUE INDEX "CredentialIssuer_slug_key" ON "CredentialIssuer"("slug");
CREATE UNIQUE INDEX "Credential_slug_key" ON "Credential"("slug");

CREATE UNIQUE INDEX "UserCredential_credentialId_identityId_key" ON "UserCredential"("credentialId", "identityId");
CREATE INDEX "UserCredential_memberId_idx" ON "UserCredential"("memberId");
CREATE INDEX "UserCredential_identityId_idx" ON "UserCredential"("identityId");
CREATE INDEX "UserCredential_status_idx" ON "UserCredential"("status");

CREATE INDEX "ReputationEvent_identityId_createdAt_idx" ON "ReputationEvent"("identityId", "createdAt" DESC);
CREATE INDEX "ReputationEvent_type_idx" ON "ReputationEvent"("type");

CREATE UNIQUE INDEX "AccessRule_slug_key" ON "AccessRule"("slug");
CREATE UNIQUE INDEX "AgentIdentity_slug_key" ON "AgentIdentity"("slug");

CREATE INDEX "ReputationLeaderboardSnapshot_snapshotAt_idx" ON "ReputationLeaderboardSnapshot"("snapshotAt" DESC);
CREATE INDEX "ReputationLeaderboardSnapshot_rank_idx" ON "ReputationLeaderboardSnapshot"("rank");

ALTER TABLE "CultureIdentity" ADD CONSTRAINT "CultureIdentity_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LinkedWallet" ADD CONSTRAINT "LinkedWallet_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "CultureIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "CredentialIssuer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "CultureIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_agentIdentityId_fkey" FOREIGN KEY ("agentIdentityId") REFERENCES "AgentIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "CultureIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
