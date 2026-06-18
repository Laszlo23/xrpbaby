-- CreateTable
CREATE TABLE "TxExplanation" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TxExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TxExplanation_createdAt_idx" ON "TxExplanation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TxExplanation_chainId_txHash_key" ON "TxExplanation"("chainId", "txHash");
