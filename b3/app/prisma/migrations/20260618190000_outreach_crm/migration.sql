-- Outreach CRM for human-approved agent drafts

CREATE TABLE "OutreachTarget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "contactEmail" TEXT,
    "contactUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'prospect',
    "notes" TEXT,
    "grantProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutreachTouch" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "forumPost" TEXT,
    "followUpVariants" JSONB,
    "grantProofUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentBy" TEXT,
    "resendId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachTouch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OutreachTarget_segment_idx" ON "OutreachTarget"("segment");
CREATE INDEX "OutreachTarget_status_idx" ON "OutreachTarget"("status");
CREATE INDEX "OutreachTouch_targetId_idx" ON "OutreachTouch"("targetId");
CREATE INDEX "OutreachTouch_status_idx" ON "OutreachTouch"("status");

ALTER TABLE "OutreachTouch" ADD CONSTRAINT "OutreachTouch_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "OutreachTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
