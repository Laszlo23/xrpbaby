-- CreateTable
CREATE TABLE "QuidliDelivery" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "amountWei" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "taskSlug" TEXT,
    "campaign" TEXT,
    "walletId" TEXT,
    "memberId" TEXT,
    "quidliRef" TEXT,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuidliDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuidliDelivery_idempotencyKey_key" ON "QuidliDelivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "QuidliDelivery_status_createdAt_idx" ON "QuidliDelivery"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "QuidliDelivery_platform_handle_idx" ON "QuidliDelivery"("platform", "handle");

-- CreateIndex
CREATE INDEX "QuidliDelivery_walletId_idx" ON "QuidliDelivery"("walletId");

-- CreateIndex
CREATE INDEX "QuidliDelivery_campaign_idx" ON "QuidliDelivery"("campaign");

-- AddForeignKey
ALTER TABLE "QuidliDelivery" ADD CONSTRAINT "QuidliDelivery_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuidliDelivery" ADD CONSTRAINT "QuidliDelivery_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
