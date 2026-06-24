-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN "stripeSessionId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceOrder_stripeSessionId_idx" ON "ServiceOrder"("stripeSessionId");

-- CreateTable
CREATE TABLE "StripeApiPurchase" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "wallet" VARCHAR(42) NOT NULL,
    "amountUsdCents" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "returnPath" TEXT,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeApiPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeApiPurchase_stripeSessionId_key" ON "StripeApiPurchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "StripeApiPurchase_wallet_sku_status_idx" ON "StripeApiPurchase"("wallet", "sku", "status");

-- CreateIndex
CREATE INDEX "StripeApiPurchase_status_idx" ON "StripeApiPurchase"("status");
