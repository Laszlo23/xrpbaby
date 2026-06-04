-- Member.privyUserId + PackPurchase (schema ahead of migrations)

ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "privyUserId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Member_privyUserId_key" ON "Member"("privyUserId");

CREATE TABLE IF NOT EXISTS "PackPurchase" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "packSlug" TEXT NOT NULL,
    "usdCents" INTEGER NOT NULL,
    "pointsGranted" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackPurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PackPurchase_stripeSessionId_key" ON "PackPurchase"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "PackPurchase_memberId_idx" ON "PackPurchase"("memberId");
CREATE INDEX IF NOT EXISTS "PackPurchase_walletId_idx" ON "PackPurchase"("walletId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PackPurchase_memberId_fkey'
  ) THEN
    ALTER TABLE "PackPurchase" ADD CONSTRAINT "PackPurchase_memberId_fkey"
      FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
