-- Growth Intelligence multi-tenant analytics

CREATE TABLE "GrowthApp" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "apiKeyHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthApp_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GrowthApp_slug_key" ON "GrowthApp"("slug");

CREATE TABLE "GrowthSession" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "memberId" TEXT,
    "walletAddress" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "GrowthSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthSession_appId_startedAt_idx" ON "GrowthSession"("appId", "startedAt" DESC);
CREATE INDEX "GrowthSession_anonymousId_idx" ON "GrowthSession"("anonymousId");
CREATE INDEX "GrowthSession_memberId_idx" ON "GrowthSession"("memberId");

CREATE TABLE "GrowthEvent" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "selector" TEXT,
    "x" INTEGER,
    "y" INTEGER,
    "scrollDepth" INTEGER,
    "viewportW" INTEGER,
    "viewportH" INTEGER,
    "meta" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthEvent_appId_occurredAt_idx" ON "GrowthEvent"("appId", "occurredAt" DESC);
CREATE INDEX "GrowthEvent_sessionId_occurredAt_idx" ON "GrowthEvent"("sessionId", "occurredAt");
CREATE INDEX "GrowthEvent_kind_occurredAt_idx" ON "GrowthEvent"("kind", "occurredAt" DESC);
CREATE INDEX "GrowthEvent_pathname_idx" ON "GrowthEvent"("pathname");

CREATE TABLE "GrowthFunnel" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthFunnel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthFunnel_appId_idx" ON "GrowthFunnel"("appId");

CREATE TABLE "GrowthInsight" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthInsight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GrowthInsight_appId_kind_dayId_title_key" ON "GrowthInsight"("appId", "kind", "dayId", "title");
CREATE INDEX "GrowthInsight_appId_dayId_idx" ON "GrowthInsight"("appId", "dayId" DESC);

CREATE TABLE "GrowthRecommendation" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "impactEstimate" TEXT,
    "effort" TEXT NOT NULL DEFAULT 'medium',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "dayId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GrowthRecommendation_appId_status_priority_idx" ON "GrowthRecommendation"("appId", "status", "priority");
CREATE INDEX "GrowthRecommendation_appId_createdAt_idx" ON "GrowthRecommendation"("appId", "createdAt" DESC);

ALTER TABLE "GrowthSession" ADD CONSTRAINT "GrowthSession_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GrowthApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrowthSession" ADD CONSTRAINT "GrowthSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GrowthApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GrowthSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrowthFunnel" ADD CONSTRAINT "GrowthFunnel_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GrowthApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrowthInsight" ADD CONSTRAINT "GrowthInsight_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GrowthApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrowthRecommendation" ADD CONSTRAINT "GrowthRecommendation_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GrowthApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
