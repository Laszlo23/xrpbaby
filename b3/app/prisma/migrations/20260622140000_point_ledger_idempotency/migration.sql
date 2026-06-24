-- CreateTable
CREATE TABLE "PointLedgerIdempotency" (
    "idempotencyKey" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointLedgerIdempotency_pkey" PRIMARY KEY ("idempotencyKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "PointLedgerIdempotency_ledgerId_key" ON "PointLedgerIdempotency"("ledgerId");

-- AddForeignKey
ALTER TABLE "PointLedgerIdempotency" ADD CONSTRAINT "PointLedgerIdempotency_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "PointLedger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
