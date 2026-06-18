-- CreateTable
CREATE TABLE "MoodCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "programDay" INTEGER NOT NULL,
    "energySlug" TEXT,
    "energyScore" INTEGER,
    "innerSlug" TEXT,
    "innerScore" INTEGER,
    "momentumSlug" TEXT,
    "momentumScore" INTEGER,
    "morningAt" DATETIME,
    "eveningAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoodCheckIn_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MoodCheckIn_memberId_idx" ON "MoodCheckIn"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MoodCheckIn_memberId_programDay_key" ON "MoodCheckIn"("memberId", "programDay");
