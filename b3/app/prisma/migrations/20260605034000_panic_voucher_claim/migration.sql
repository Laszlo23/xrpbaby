-- Panic Switch hidden voucher NFT claim persistence

CREATE TABLE IF NOT EXISTS "PanicVoucherClaim" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "dayUTC" TEXT NOT NULL,
    "sessionIdHash" TEXT NOT NULL,
    "clueFingerprintHash" TEXT NOT NULL,
    "riddleAnswerHash" TEXT NOT NULL,
    "claimDigest" TEXT NOT NULL,
    "precisionScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "chainId" INTEGER,
    "contractAddress" TEXT,
    "txHash" TEXT,
    "tokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mintedAt" TIMESTAMP(3),
    CONSTRAINT "PanicVoucherClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PanicVoucherClaim_sessionIdHash_key" ON "PanicVoucherClaim"("sessionIdHash");
CREATE UNIQUE INDEX IF NOT EXISTS "PanicVoucherClaim_claimDigest_key" ON "PanicVoucherClaim"("claimDigest");
CREATE UNIQUE INDEX IF NOT EXISTS "PanicVoucherClaim_walletId_key" ON "PanicVoucherClaim"("walletId");
CREATE INDEX IF NOT EXISTS "PanicVoucherClaim_status_idx" ON "PanicVoucherClaim"("status");
CREATE INDEX IF NOT EXISTS "PanicVoucherClaim_createdAt_idx" ON "PanicVoucherClaim"("createdAt" DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PanicVoucherClaim_memberId_fkey'
  ) THEN
    ALTER TABLE "PanicVoucherClaim" ADD CONSTRAINT "PanicVoucherClaim_memberId_fkey"
      FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PanicVoucherClaim_walletId_fkey'
  ) THEN
    ALTER TABLE "PanicVoucherClaim" ADD CONSTRAINT "PanicVoucherClaim_walletId_fkey"
      FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

