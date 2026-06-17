-- CreateTable
CREATE TABLE "IdentityEnrichmentCache" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "fullName" TEXT,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityEnrichmentCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityEnrichmentCache_owner_key" ON "IdentityEnrichmentCache"("owner");

-- CreateIndex
CREATE INDEX "IdentityEnrichmentCache_expiresAt_idx" ON "IdentityEnrichmentCache"("expiresAt");
