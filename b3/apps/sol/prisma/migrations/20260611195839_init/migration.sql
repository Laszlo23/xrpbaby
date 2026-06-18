-- CreateTable
CREATE TABLE "Builder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "builderScore" INTEGER NOT NULL DEFAULT 0,
    "enrolledPathSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "bccReward" INTEGER NOT NULL DEFAULT 0,
    "nftAchievementKey" TEXT,
    "pathSlug" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MissionCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "builderId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" DATETIME,
    "txSignature" TEXT,
    "nftMint" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MissionCompletion_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "Builder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MissionCompletion_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "builderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metadataUri" TEXT,
    "mintAddress" TEXT,
    "missionSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Achievement_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "Builder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Builder_walletAddress_key" ON "Builder"("walletAddress");

-- CreateIndex
CREATE INDEX "Builder_walletAddress_idx" ON "Builder"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_slug_key" ON "Mission"("slug");

-- CreateIndex
CREATE INDEX "Mission_slug_idx" ON "Mission"("slug");

-- CreateIndex
CREATE INDEX "Mission_pathSlug_idx" ON "Mission"("pathSlug");

-- CreateIndex
CREATE INDEX "MissionCompletion_builderId_idx" ON "MissionCompletion"("builderId");

-- CreateIndex
CREATE INDEX "MissionCompletion_missionId_idx" ON "MissionCompletion"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionCompletion_builderId_missionId_key" ON "MissionCompletion"("builderId", "missionId");

-- CreateIndex
CREATE INDEX "Achievement_builderId_idx" ON "Achievement"("builderId");

-- CreateIndex
CREATE INDEX "Achievement_mintAddress_idx" ON "Achievement"("mintAddress");
