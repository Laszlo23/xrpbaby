-- CreateTable
CREATE TABLE "AgentActionLog" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "params" JSONB,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "txHash" TEXT,
    "status" TEXT NOT NULL,
    "errorMsg" TEXT,
    "costUsd" TEXT,

    CONSTRAINT "AgentActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentActionLog_agentId_createdAt_idx" ON "AgentActionLog"("agentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AgentActionLog_createdAt_idx" ON "AgentActionLog"("createdAt");
