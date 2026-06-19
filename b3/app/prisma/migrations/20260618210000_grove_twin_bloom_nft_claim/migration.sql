-- CreateTable
CREATE TABLE IF NOT EXISTS "GroveTwinBloomNftClaim" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "claimDigest" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "chainId" INTEGER,
    "contractAddress" TEXT,
    "txHash" TEXT,
    "tokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mintedAt" TIMESTAMP(3),

    CONSTRAINT "GroveTwinBloomNftClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroveTwinBloomNftClaim_memberId_key" ON "GroveTwinBloomNftClaim"("memberId");
CREATE UNIQUE INDEX IF NOT EXISTS "GroveTwinBloomNftClaim_walletId_key" ON "GroveTwinBloomNftClaim"("walletId");
CREATE UNIQUE INDEX IF NOT EXISTS "GroveTwinBloomNftClaim_claimDigest_key" ON "GroveTwinBloomNftClaim"("claimDigest");
CREATE INDEX IF NOT EXISTS "GroveTwinBloomNftClaim_status_idx" ON "GroveTwinBloomNftClaim"("status");
CREATE INDEX IF NOT EXISTS "GroveTwinBloomNftClaim_createdAt_idx" ON "GroveTwinBloomNftClaim"("createdAt" DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GroveTwinBloomNftClaim_memberId_fkey'
  ) THEN
    ALTER TABLE "GroveTwinBloomNftClaim" ADD CONSTRAINT "GroveTwinBloomNftClaim_memberId_fkey"
      FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'GroveTwinBloomNftClaim_walletId_fkey'
  ) THEN
    ALTER TABLE "GroveTwinBloomNftClaim" ADD CONSTRAINT "GroveTwinBloomNftClaim_walletId_fkey"
      FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
