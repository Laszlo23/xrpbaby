-- XRPL link challenge persistence (Phase 2)

CREATE TABLE "XrplLinkChallenge" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XrplLinkChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "XrplLinkChallenge_nonce_key" ON "XrplLinkChallenge"("nonce");
CREATE INDEX "XrplLinkChallenge_identityId_idx" ON "XrplLinkChallenge"("identityId");
CREATE INDEX "XrplLinkChallenge_expiresAt_idx" ON "XrplLinkChallenge"("expiresAt");
