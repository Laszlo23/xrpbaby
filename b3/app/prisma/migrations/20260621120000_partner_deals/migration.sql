-- Partner service escrow deals
CREATE TABLE "PartnerDeal" (
    "id" TEXT NOT NULL,
    "onChainDealId" TEXT,
    "metadataUri" TEXT,
    "metadataHash" VARCHAR(66) NOT NULL,
    "title" TEXT NOT NULL,
    "payerWallet" VARCHAR(42) NOT NULL,
    "providerWallet" VARCHAR(42) NOT NULL,
    "amountUsdc" TEXT NOT NULL,
    "deliverBy" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "fundTxHash" TEXT,
    "evidenceTxHash" TEXT,
    "settleTxHash" TEXT,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerDeal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerDealEvidence" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "submittedBy" VARCHAR(42) NOT NULL,
    "evidenceUri" TEXT,
    "evidenceHash" VARCHAR(66) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerDealEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PartnerDealRuling" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "payoutBps" INTEGER NOT NULL,
    "rulingUri" TEXT,
    "rulingHash" VARCHAR(66) NOT NULL,
    "aiConfidence" DOUBLE PRECISION,
    "councilOverride" BOOLEAN NOT NULL DEFAULT false,
    "reasoning" JSONB NOT NULL DEFAULT '{}',
    "proposeTxHash" TEXT,
    "overrideTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerDealRuling_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PartnerDeal_payerWallet_idx" ON "PartnerDeal"("payerWallet");
CREATE INDEX "PartnerDeal_providerWallet_idx" ON "PartnerDeal"("providerWallet");
CREATE INDEX "PartnerDeal_status_idx" ON "PartnerDeal"("status");
CREATE INDEX "PartnerDeal_onChainDealId_idx" ON "PartnerDeal"("onChainDealId");
CREATE INDEX "PartnerDealEvidence_dealId_idx" ON "PartnerDealEvidence"("dealId");
CREATE INDEX "PartnerDealRuling_dealId_idx" ON "PartnerDealRuling"("dealId");

ALTER TABLE "PartnerDealEvidence" ADD CONSTRAINT "PartnerDealEvidence_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "PartnerDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerDealRuling" ADD CONSTRAINT "PartnerDealRuling_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "PartnerDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
