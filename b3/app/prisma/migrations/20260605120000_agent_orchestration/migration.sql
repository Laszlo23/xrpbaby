-- Agent orchestration: task queue, outcomes, spend tracking, prompt versions, corpus

CREATE TABLE "AgentOutcome" (
    "id" TEXT NOT NULL,
    "actionLogIds" JSONB NOT NULL DEFAULT '[]',
    "kpiSnapshot" JSONB,
    "rewardScore" DOUBLE PRECISION,
    "learnings" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentOutcome_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentTask" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedAgentId" TEXT,
    "budgetUsdCap" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT 'ceo-orchestrator-0',
    "outcomeId" TEXT,
    "errorMsg" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentDailySpend" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "spendDate" TEXT NOT NULL,
    "apiUsd" TEXT NOT NULL DEFAULT '0',
    "gasEth" TEXT NOT NULL DEFAULT '0',
    "deployUsd" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDailySpend_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentPromptVersion" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "rewardScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentPromptVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentCorpusChunk" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentCorpusChunk_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgentOutcome_createdAt_idx" ON "AgentOutcome"("createdAt" DESC);

CREATE INDEX "AgentTask_status_priority_createdAt_idx" ON "AgentTask"("status", "priority" DESC, "createdAt");
CREATE INDEX "AgentTask_assignedAgentId_idx" ON "AgentTask"("assignedAgentId");

CREATE UNIQUE INDEX "AgentDailySpend_agentId_spendDate_key" ON "AgentDailySpend"("agentId", "spendDate");
CREATE INDEX "AgentDailySpend_spendDate_idx" ON "AgentDailySpend"("spendDate");

CREATE UNIQUE INDEX "AgentPromptVersion_agentId_version_key" ON "AgentPromptVersion"("agentId", "version");
CREATE INDEX "AgentPromptVersion_agentId_active_idx" ON "AgentPromptVersion"("agentId", "active");

CREATE INDEX "AgentCorpusChunk_source_idx" ON "AgentCorpusChunk"("source");

ALTER TABLE "AgentTask" ADD CONSTRAINT "AgentTask_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "AgentOutcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;
