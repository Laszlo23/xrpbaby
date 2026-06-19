-- Culture Power state + proofs

CREATE TABLE "MemberPowerState" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "powerScore" INTEGER NOT NULL DEFAULT 400,
    "peakScore7d" INTEGER NOT NULL DEFAULT 400,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastMaintenance" TIMESTAMP(3),
    "lastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberPowerState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberPowerProof" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "proofRef" TEXT NOT NULL,
    "amountWei" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberPowerProof_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MemberPowerState_memberId_key" ON "MemberPowerState"("memberId");
CREATE INDEX "MemberPowerProof_memberId_kind_idx" ON "MemberPowerProof"("memberId", "kind");

ALTER TABLE "MemberPowerState" ADD CONSTRAINT "MemberPowerState_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberPowerProof" ADD CONSTRAINT "MemberPowerProof_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
