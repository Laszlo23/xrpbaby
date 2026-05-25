-- Unified member, activity, rewards, waitlist

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT,
    "farcasterFid" INTEGER,
    "email" TEXT,
    "displayName" TEXT,
    "intent" TEXT,
    "supporterTier" TEXT NOT NULL DEFAULT 'community',
    "forestStage" TEXT NOT NULL DEFAULT 'seedling',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletId" TEXT,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "type" TEXT NOT NULL,
    "sourceModule" TEXT NOT NULL DEFAULT 'app',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RewardGrant" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardGrant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Member_walletAddress_key" ON "Member"("walletAddress");
CREATE UNIQUE INDEX "Member_farcasterFid_key" ON "Member"("farcasterFid");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE UNIQUE INDEX "Member_walletId_key" ON "Member"("walletId");
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

CREATE INDEX "ActivityEvent_memberId_createdAt_idx" ON "ActivityEvent"("memberId", "createdAt" DESC);
CREATE INDEX "ActivityEvent_type_createdAt_idx" ON "ActivityEvent"("type", "createdAt" DESC);
CREATE INDEX "RewardGrant_memberId_idx" ON "RewardGrant"("memberId");

ALTER TABLE "Member" ADD CONSTRAINT "Member_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RewardGrant" ADD CONSTRAINT "RewardGrant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
