-- Culture Pulse: social feed, comments, growth snapshots, on-chain attestations

CREATE TABLE "SocialFeedItem" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT,
    "authorHandle" TEXT,
    "authorName" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrls" JSONB,
    "permalink" TEXT,
    "metrics" JSONB,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SocialFeedItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialFeedItem_platform_externalId_key" ON "SocialFeedItem"("platform", "externalId");
CREATE INDEX "SocialFeedItem_publishedAt_idx" ON "SocialFeedItem"("publishedAt" DESC);
CREATE INDEX "SocialFeedItem_platform_publishedAt_idx" ON "SocialFeedItem"("platform", "publishedAt" DESC);

CREATE TABLE "SocialComment" (
    "id" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SocialComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialComment_feedItemId_createdAt_idx" ON "SocialComment"("feedItemId", "createdAt" DESC);

ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "SocialFeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "GrowthSnapshot" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberCount" INTEGER NOT NULL,
    "waitlistCount" INTEGER NOT NULL,
    "culturePoints" INTEGER NOT NULL,
    "activity24h" INTEGER NOT NULL,
    "farcasterItems" INTEGER NOT NULL,
    "xItems" INTEGER NOT NULL,
    "facebookItems" INTEGER NOT NULL DEFAULT 0,
    "tiktokItems" INTEGER NOT NULL DEFAULT 0,
    "instagramItems" INTEGER NOT NULL DEFAULT 0,
    "nativeComments" INTEGER NOT NULL,
    "digest" TEXT NOT NULL,

    CONSTRAINT "GrowthSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthSnapshot_capturedAt_idx" ON "GrowthSnapshot"("capturedAt" DESC);

CREATE TABLE "PulseAttestation" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "metadataUri" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PulseAttestation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PulseAttestation_dayId_key" ON "PulseAttestation"("dayId");
