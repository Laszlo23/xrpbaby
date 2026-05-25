-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointLedger" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "taskSlug" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDefinition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaskDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirdropCampaign" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "snapshotAt" TIMESTAMP(3),
    "merkleRoot" TEXT,

    CONSTRAINT "AirdropCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirdropAllocation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amountWei" TEXT,
    "pointsSnapshot" INTEGER,

    CONSTRAINT "AirdropAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "PointLedger_walletId_idx" ON "PointLedger"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDefinition_slug_key" ON "TaskDefinition"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AirdropCampaign_slug_key" ON "AirdropCampaign"("slug");

-- CreateIndex
CREATE INDEX "AirdropAllocation_campaignId_idx" ON "AirdropAllocation"("campaignId");

-- CreateIndex
CREATE INDEX "AirdropAllocation_walletId_idx" ON "AirdropAllocation"("walletId");

-- AddForeignKey
ALTER TABLE "PointLedger" ADD CONSTRAINT "PointLedger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropAllocation" ADD CONSTRAINT "AirdropAllocation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AirdropCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirdropAllocation" ADD CONSTRAINT "AirdropAllocation_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
