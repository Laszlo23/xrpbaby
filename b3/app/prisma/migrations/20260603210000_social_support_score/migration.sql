-- AlterTable
ALTER TABLE "Member" ADD COLUMN "farcasterUsername" TEXT,
ADD COLUMN "neynarScore" DOUBLE PRECISION,
ADD COLUMN "supportScore" INTEGER,
ADD COLUMN "supportScoreMeta" JSONB,
ADD COLUMN "socialSyncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT,
    "externalId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'neynar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_memberId_platform_key" ON "SocialAccount"("memberId", "platform");

-- CreateIndex
CREATE INDEX "SocialAccount_platform_handle_idx" ON "SocialAccount"("platform", "handle");

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
