-- AlterTable
ALTER TABLE "Member" ADD COLUMN "linkWalletNonce" TEXT;
ALTER TABLE "Member" ADD COLUMN "linkWalletNonceExpiresAt" DATETIME;

-- CreateTable
CREATE TABLE "ProofSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "proofScore" INTEGER NOT NULL,
    "signalsJson" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "anchorNonce" TEXT,
    "anchorNonceExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProofSnapshot_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProofAnchor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "anchoredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProofAnchor_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ProofSnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProofAnchor_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProofSnapshot_memberId_idx" ON "ProofSnapshot"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ProofSnapshot_memberId_periodKey_key" ON "ProofSnapshot"("memberId", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "ProofAnchor_snapshotId_key" ON "ProofAnchor"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "ProofAnchor_txSignature_key" ON "ProofAnchor"("txSignature");

-- CreateIndex
CREATE INDEX "ProofAnchor_memberId_idx" ON "ProofAnchor"("memberId");
