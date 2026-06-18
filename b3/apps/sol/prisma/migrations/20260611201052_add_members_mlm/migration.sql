-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "trackSlug" TEXT NOT NULL,
    "walletAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "trackSlug" TEXT,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MemberDeliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberDeliverable_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MemberDeliverable_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferralEarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "earnerId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferralEarning_earnerId_fkey" FOREIGN KEY ("earnerId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReferralEarning_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_referralCode_key" ON "Member"("referralCode");

-- CreateIndex
CREATE INDEX "Member_email_idx" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_referralCode_idx" ON "Member"("referralCode");

-- CreateIndex
CREATE INDEX "Member_referredById_idx" ON "Member"("referredById");

-- CreateIndex
CREATE UNIQUE INDEX "MemberSession_token_key" ON "MemberSession"("token");

-- CreateIndex
CREATE INDEX "MemberSession_token_idx" ON "MemberSession"("token");

-- CreateIndex
CREATE INDEX "MemberSession_memberId_idx" ON "MemberSession"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Deliverable_slug_key" ON "Deliverable"("slug");

-- CreateIndex
CREATE INDEX "Deliverable_dayNumber_idx" ON "Deliverable"("dayNumber");

-- CreateIndex
CREATE INDEX "Deliverable_trackSlug_idx" ON "Deliverable"("trackSlug");

-- CreateIndex
CREATE INDEX "MemberDeliverable_memberId_idx" ON "MemberDeliverable"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberDeliverable_memberId_deliverableId_key" ON "MemberDeliverable"("memberId", "deliverableId");

-- CreateIndex
CREATE INDEX "ReferralEarning_earnerId_idx" ON "ReferralEarning"("earnerId");

-- CreateIndex
CREATE INDEX "ReferralEarning_sourceId_idx" ON "ReferralEarning"("sourceId");
