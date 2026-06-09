-- CreateTable
CREATE TABLE "PointRedemption" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "bccWei" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "txHash" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditedAt" TIMESTAMP(3),

    CONSTRAINT "PointRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PointRedemption_idempotencyKey_key" ON "PointRedemption"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PointRedemption_walletId_idx" ON "PointRedemption"("walletId");

-- CreateIndex
CREATE INDEX "PointRedemption_status_idx" ON "PointRedemption"("status");

-- CreateIndex
CREATE INDEX "PointRedemption_createdAt_idx" ON "PointRedemption"("createdAt");

-- AddForeignKey
ALTER TABLE "PointRedemption" ADD CONSTRAINT "PointRedemption_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
