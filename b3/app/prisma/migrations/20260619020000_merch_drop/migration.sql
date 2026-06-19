-- CreateTable
CREATE TABLE "MerchDrop" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "editionCap" INTEGER NOT NULL DEFAULT 77,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "productionTargetUsd" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "fundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchDrop_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "MerchOrder" (
    "id" TEXT NOT NULL,
    "dropSlug" TEXT NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "wallet" VARCHAR(42) NOT NULL,
    "priceUsd" DECIMAL(10,2) NOT NULL,
    "paymentRail" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "x402TxHash" TEXT,
    "claimCode" TEXT NOT NULL,
    "shipping" JSONB NOT NULL,
    "revenueSplit" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchDrop_status_idx" ON "MerchDrop"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MerchOrder_claimCode_key" ON "MerchOrder"("claimCode");

-- CreateIndex
CREATE INDEX "MerchOrder_wallet_idx" ON "MerchOrder"("wallet");

-- CreateIndex
CREATE INDEX "MerchOrder_dropSlug_status_idx" ON "MerchOrder"("dropSlug", "status");

-- CreateIndex
CREATE INDEX "MerchOrder_claimCode_idx" ON "MerchOrder"("claimCode");

-- CreateIndex
CREATE UNIQUE INDEX "MerchOrder_dropSlug_unitNumber_key" ON "MerchOrder"("dropSlug", "unitNumber");

-- AddForeignKey
ALTER TABLE "MerchOrder" ADD CONSTRAINT "MerchOrder_dropSlug_fkey" FOREIGN KEY ("dropSlug") REFERENCES "MerchDrop"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
