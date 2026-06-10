-- CreateTable
CREATE TABLE "ProductFeedback" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "triedWhat" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "suggestion" TEXT,
    "evidenceUrl" TEXT,
    "pagePath" TEXT,
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'rejected',
    "rejectReason" TEXT,
    "pointsGranted" INTEGER NOT NULL DEFAULT 0,
    "publicTitle" TEXT,
    "showOnWall" BOOLEAN NOT NULL DEFAULT false,
    "weekBucket" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFeedback_memberId_createdAt_idx" ON "ProductFeedback"("memberId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductFeedback_status_createdAt_idx" ON "ProductFeedback"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductFeedback_showOnWall_status_idx" ON "ProductFeedback"("showOnWall", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFeedback_memberId_weekBucket_key" ON "ProductFeedback"("memberId", "weekBucket");

-- AddForeignKey
ALTER TABLE "ProductFeedback" ADD CONSTRAINT "ProductFeedback_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
