-- Culture Grove viral invite tree
CREATE TABLE "CultureGroveLink" (
    "id" TEXT NOT NULL,
    "inviterMemberId" TEXT NOT NULL,
    "inviteeMemberId" TEXT NOT NULL,
    "agentRef" TEXT,
    "dnaHue" INTEGER NOT NULL DEFAULT 160,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CultureGroveLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CultureGroveLink_inviteeMemberId_key" ON "CultureGroveLink"("inviteeMemberId");
CREATE INDEX "CultureGroveLink_inviterMemberId_createdAt_idx" ON "CultureGroveLink"("inviterMemberId", "createdAt" DESC);

ALTER TABLE "CultureGroveLink" ADD CONSTRAINT "CultureGroveLink_inviterMemberId_fkey" FOREIGN KEY ("inviterMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CultureGroveLink" ADD CONSTRAINT "CultureGroveLink_inviteeMemberId_fkey" FOREIGN KEY ("inviteeMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
