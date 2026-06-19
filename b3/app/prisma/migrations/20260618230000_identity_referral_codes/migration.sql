-- Culture ID referral codes + redemptions

CREATE TABLE "IdentityReferralCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerWallet" VARCHAR(42) NOT NULL,
    "batchIndex" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "consumedBy" VARCHAR(42),
    "consumedAt" TIMESTAMP(3),
    "mintHandle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityReferralCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdentityReferralRedemption" (
    "id" TEXT NOT NULL,
    "wallet" VARCHAR(42) NOT NULL,
    "code" TEXT NOT NULL,
    "codeId" TEXT,
    "mintHandle" TEXT NOT NULL,
    "tokenId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityReferralRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IdentityReferralCode_code_key" ON "IdentityReferralCode"("code");
CREATE INDEX "IdentityReferralCode_ownerWallet_idx" ON "IdentityReferralCode"("ownerWallet");
CREATE INDEX "IdentityReferralCode_status_idx" ON "IdentityReferralCode"("status");
CREATE UNIQUE INDEX "IdentityReferralRedemption_wallet_key" ON "IdentityReferralRedemption"("wallet");
CREATE INDEX "IdentityReferralRedemption_code_idx" ON "IdentityReferralRedemption"("code");

-- Launch code BUILD77 (owner = zero address placeholder; update via env on first sync)
INSERT INTO "IdentityReferralCode" ("id", "code", "ownerWallet", "batchIndex", "status", "createdAt", "updatedAt")
VALUES (
  'launch_build77',
  'BUILD77',
  '0x0000000000000000000000000000000000000000',
  -1,
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("code") DO NOTHING;
