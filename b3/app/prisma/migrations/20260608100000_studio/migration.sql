-- BC Studio models
CREATE TABLE "StudioProject" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "framework" TEXT NOT NULL DEFAULT 'vite-react',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sandboxPort" INTEGER,
    "sandboxContainerId" TEXT,
    "previewUrl" TEXT,
    "publishedUrl" TEXT,
    "createOsProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudioFile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudioMessage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudioUsage" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudioProject_memberId_slug_key" ON "StudioProject"("memberId", "slug");
CREATE INDEX "StudioProject_memberId_updatedAt_idx" ON "StudioProject"("memberId", "updatedAt" DESC);
CREATE INDEX "StudioProject_status_idx" ON "StudioProject"("status");

CREATE UNIQUE INDEX "StudioFile_projectId_path_key" ON "StudioFile"("projectId", "path");
CREATE INDEX "StudioFile_projectId_idx" ON "StudioFile"("projectId");

CREATE INDEX "StudioMessage_projectId_createdAt_idx" ON "StudioMessage"("projectId", "createdAt");

CREATE INDEX "StudioUsage_memberId_createdAt_idx" ON "StudioUsage"("memberId", "createdAt" DESC);
CREATE INDEX "StudioUsage_projectId_idx" ON "StudioUsage"("projectId");

ALTER TABLE "StudioProject" ADD CONSTRAINT "StudioProject_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioFile" ADD CONSTRAINT "StudioFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioMessage" ADD CONSTRAINT "StudioMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioUsage" ADD CONSTRAINT "StudioUsage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudioUsage" ADD CONSTRAINT "StudioUsage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
