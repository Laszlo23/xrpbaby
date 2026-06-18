-- AlterTable
ALTER TABLE "Member" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Member" ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "StripeCheckout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeSessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trackSlug" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "referralCode" TEXT,
    "memberId" TEXT,
    "fulfilledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StripeCheckout_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeCheckout_stripeSessionId_key" ON "StripeCheckout"("stripeSessionId");

-- CreateIndex
CREATE INDEX "StripeCheckout_stripeSessionId_idx" ON "StripeCheckout"("stripeSessionId");

-- CreateIndex
CREATE INDEX "StripeCheckout_email_idx" ON "StripeCheckout"("email");

-- CreateIndex
CREATE INDEX "Member_stripeCustomerId_idx" ON "Member"("stripeCustomerId");
