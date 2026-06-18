-- AlterTable
ALTER TABLE "MemberDeliverable" ADD COLUMN "checklistJson" TEXT;
ALTER TABLE "MemberDeliverable" ADD COLUMN "reflectionNote" TEXT;

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mood" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MemberAchievement_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "trackSlug" TEXT NOT NULL,
    "buildFocus" TEXT,
    "walletAddress" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "programStartDate" DATETIME,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "identityJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("createdAt", "email", "id", "name", "plan", "referralCode", "referredById", "stripeCustomerId", "stripeSubscriptionId", "trackSlug", "updatedAt", "walletAddress") SELECT "createdAt", "email", "id", "name", "plan", "referralCode", "referredById", "stripeCustomerId", "stripeSubscriptionId", "trackSlug", "updatedAt", "walletAddress" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE UNIQUE INDEX "Member_referralCode_key" ON "Member"("referralCode");
CREATE INDEX "Member_email_idx" ON "Member"("email");
CREATE INDEX "Member_referralCode_idx" ON "Member"("referralCode");
CREATE INDEX "Member_referredById_idx" ON "Member"("referredById");
CREATE INDEX "Member_stripeCustomerId_idx" ON "Member"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "JournalEntry_memberId_idx" ON "JournalEntry"("memberId");

-- CreateIndex
CREATE INDEX "JournalEntry_memberId_dayNumber_idx" ON "JournalEntry"("memberId", "dayNumber");

-- CreateIndex
CREATE INDEX "MemberAchievement_memberId_idx" ON "MemberAchievement"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAchievement_memberId_slug_key" ON "MemberAchievement"("memberId", "slug");
