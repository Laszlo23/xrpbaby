-- CreateTable
CREATE TABLE "StripeMemberSubscription" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "wallet" VARCHAR(42) NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeMemberSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeMemberSubscription_stripeSubscriptionId_key" ON "StripeMemberSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "StripeMemberSubscription_wallet_status_idx" ON "StripeMemberSubscription"("wallet", "status");

-- CreateIndex
CREATE INDEX "StripeMemberSubscription_memberId_idx" ON "StripeMemberSubscription"("memberId");

-- CreateIndex
CREATE INDEX "StripeMemberSubscription_status_idx" ON "StripeMemberSubscription"("status");
