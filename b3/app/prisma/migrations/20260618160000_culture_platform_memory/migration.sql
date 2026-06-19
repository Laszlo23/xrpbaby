-- CreateTable
CREATE TABLE "AgentInboxThread" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "walletAddress" VARCHAR(42) NOT NULL,
    "subject" TEXT NOT NULL,
    "agentKind" TEXT NOT NULL DEFAULT 'research',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentInboxThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentInboxMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "body" TEXT NOT NULL,
    "draftJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentInboxMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrandStoryQuest" (
    "id" TEXT NOT NULL,
    "creatorWallet" VARCHAR(42) NOT NULL,
    "title" TEXT NOT NULL,
    "storyMarkdown" TEXT NOT NULL,
    "rewardPoints" INTEGER NOT NULL DEFAULT 100,
    "ticketPackSlug" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandStoryQuest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrandStoryQuestParticipant" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "wallet" VARCHAR(42) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandStoryQuestParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CultureMemoryEvent" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "wallet" VARCHAR(42),
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "agentRef" TEXT,
    "questId" TEXT,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CultureMemoryEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgentInboxThread_walletAddress_idx" ON "AgentInboxThread"("walletAddress");
CREATE INDEX "AgentInboxThread_status_idx" ON "AgentInboxThread"("status");
CREATE INDEX "AgentInboxMessage_threadId_idx" ON "AgentInboxMessage"("threadId");
CREATE INDEX "BrandStoryQuest_creatorWallet_idx" ON "BrandStoryQuest"("creatorWallet");
CREATE INDEX "BrandStoryQuest_status_idx" ON "BrandStoryQuest"("status");
CREATE UNIQUE INDEX "BrandStoryQuestParticipant_questId_wallet_key" ON "BrandStoryQuestParticipant"("questId", "wallet");
CREATE INDEX "BrandStoryQuestParticipant_wallet_idx" ON "BrandStoryQuestParticipant"("wallet");
CREATE INDEX "CultureMemoryEvent_memberId_createdAt_idx" ON "CultureMemoryEvent"("memberId", "createdAt" DESC);
CREATE INDEX "CultureMemoryEvent_wallet_createdAt_idx" ON "CultureMemoryEvent"("wallet", "createdAt" DESC);
CREATE INDEX "CultureMemoryEvent_type_idx" ON "CultureMemoryEvent"("type");

ALTER TABLE "AgentInboxMessage" ADD CONSTRAINT "AgentInboxMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "AgentInboxThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrandStoryQuestParticipant" ADD CONSTRAINT "BrandStoryQuestParticipant_questId_fkey" FOREIGN KEY ("questId") REFERENCES "BrandStoryQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
