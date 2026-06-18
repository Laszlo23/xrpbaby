-- CreateTable
CREATE TABLE "MemberCommunityStake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "paidCents" INTEGER NOT NULL,
    "lockCents" INTEGER NOT NULL,
    "bccAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_wallet',
    "walletAddress" TEXT,
    "lockTxSignature" TEXT,
    "stakedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberCommunityStake_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MemberCommunityStake_memberId_idx" ON "MemberCommunityStake"("memberId");

-- CreateIndex
CREATE INDEX "MemberCommunityStake_status_idx" ON "MemberCommunityStake"("status");
