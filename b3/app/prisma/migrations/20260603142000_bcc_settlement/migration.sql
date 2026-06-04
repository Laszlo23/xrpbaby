-- CreateTable
CREATE TABLE "BccSettlement" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "packSlug" TEXT,
    "stripeSessionId" TEXT,
    "usdCents" INTEGER NOT NULL,
    "bccOwedWei" TEXT NOT NULL,
    "bonusBccWei" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditedAt" TIMESTAMP(3),

    CONSTRAINT "BccSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BccSettlement_stripeSessionId_key" ON "BccSettlement"("stripeSessionId");

-- CreateIndex
CREATE INDEX "BccSettlement_memberId_idx" ON "BccSettlement"("memberId");

-- CreateIndex
CREATE INDEX "BccSettlement_status_idx" ON "BccSettlement"("status");

-- AddForeignKey
ALTER TABLE "BccSettlement" ADD CONSTRAINT "BccSettlement_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
