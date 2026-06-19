-- Marketplace service orders (x402 USDC deliverables)

CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "wallet" VARCHAR(42) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "brief" JSONB NOT NULL DEFAULT '{}',
    "x402TxHash" TEXT,
    "amountUsdc" TEXT NOT NULL,
    "threadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceMilestone" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agentTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceMilestone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceMilestone_orderId_index_key" ON "ServiceMilestone"("orderId", "index");
CREATE INDEX "ServiceMilestone_orderId_idx" ON "ServiceMilestone"("orderId");
CREATE INDEX "ServiceMilestone_status_idx" ON "ServiceMilestone"("status");
CREATE INDEX "ServiceOrder_wallet_idx" ON "ServiceOrder"("wallet");
CREATE INDEX "ServiceOrder_slug_idx" ON "ServiceOrder"("slug");
CREATE INDEX "ServiceOrder_status_idx" ON "ServiceOrder"("status");

ALTER TABLE "ServiceMilestone" ADD CONSTRAINT "ServiceMilestone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
