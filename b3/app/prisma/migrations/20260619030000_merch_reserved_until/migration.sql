-- AlterTable
ALTER TABLE "MerchOrder" ADD COLUMN "reservedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MerchOrder_status_reservedUntil_idx" ON "MerchOrder"("status", "reservedUntil");
