import { getStripeApiSku } from "@/lib/billing/stripe-api-catalog";
import { getPrisma } from "@/server/db/prisma";

const PURCHASE_TTL_MS = 24 * 60 * 60 * 1000;

export type StripePurchaseStatus =
  | "pending_payment"
  | "paid"
  | "consumed"
  | "expired"
  | "cancelled";

export function extractStripePurchaseId(request: Request): string | undefined {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("stripe_purchase_id")?.trim();
  if (fromQuery) return fromQuery;
  return request.headers.get("x-stripe-purchase-id")?.trim() || undefined;
}

export async function createStripeApiPurchase(input: {
  sku: string;
  wallet: string;
  amountUsdCents: number;
  stripeSessionId: string;
  returnPath?: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const purchase = await prisma.stripeApiPurchase.create({
    data: {
      sku: input.sku,
      wallet: input.wallet.toLowerCase(),
      amountUsdCents: input.amountUsdCents,
      stripeSessionId: input.stripeSessionId,
      status: "pending_payment",
      returnPath: input.returnPath ?? null,
    },
  });

  return { ok: true as const, purchase };
}

export async function markStripeApiPurchasePaid(stripeSessionId: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const existing = await prisma.stripeApiPurchase.findUnique({
    where: { stripeSessionId },
  });
  if (!existing) return { ok: false as const, error: "purchase_not_found" };
  if (existing.status === "paid" || existing.status === "consumed") {
    return { ok: true as const, purchase: existing, alreadyPaid: true };
  }
  if (existing.status !== "pending_payment") {
    return { ok: false as const, error: "invalid_status", status: existing.status };
  }

  const expiresAt = new Date(Date.now() + PURCHASE_TTL_MS);
  const purchase = await prisma.stripeApiPurchase.update({
    where: { id: existing.id },
    data: { status: "paid", expiresAt },
  });

  return { ok: true as const, purchase, alreadyPaid: false };
}

export async function cancelStripeApiPurchaseBySession(stripeSessionId: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const existing = await prisma.stripeApiPurchase.findUnique({
    where: { stripeSessionId },
  });
  if (!existing || existing.status !== "pending_payment") {
    return { ok: true as const, skipped: true };
  }

  await prisma.stripeApiPurchase.update({
    where: { id: existing.id },
    data: { status: "cancelled" },
  });

  return { ok: true as const, skipped: false };
}

export async function validateAndConsumeStripePurchase(input: {
  purchaseId: string;
  sku: string;
  wallet?: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const purchase = await prisma.stripeApiPurchase.findUnique({
    where: { id: input.purchaseId },
  });
  if (!purchase) return { ok: false as const, error: "purchase_not_found" };
  if (purchase.sku !== input.sku) return { ok: false as const, error: "sku_mismatch" };
  if (purchase.status === "consumed") {
    return { ok: false as const, error: "purchase_already_consumed" };
  }
  if (purchase.status !== "paid") {
    return { ok: false as const, error: "purchase_not_paid", status: purchase.status };
  }
  if (purchase.expiresAt && purchase.expiresAt.getTime() < Date.now()) {
    await prisma.stripeApiPurchase.update({
      where: { id: purchase.id },
      data: { status: "expired" },
    });
    return { ok: false as const, error: "purchase_expired" };
  }
  if (input.wallet && purchase.wallet !== input.wallet.toLowerCase()) {
    return { ok: false as const, error: "wallet_mismatch" };
  }

  const consumed = await prisma.stripeApiPurchase.update({
    where: { id: purchase.id },
    data: { status: "consumed", consumedAt: new Date() },
  });

  return { ok: true as const, purchase: consumed };
}

export async function verifyStripeApiSessionMetadata(input: {
  purchaseId: string;
  stripeSessionId: string;
  amountTotalCents: number | null;
  metadataSku?: string;
  metadataWallet?: string;
}) {
  const skuEntry = input.metadataSku ? getStripeApiSku(input.metadataSku) : undefined;
  if (!skuEntry) return { ok: false as const, error: "unknown_sku" };

  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const purchase = await prisma.stripeApiPurchase.findUnique({
    where: { id: input.purchaseId },
  });
  if (!purchase) return { ok: false as const, error: "purchase_not_found" };
  if (purchase.stripeSessionId !== input.stripeSessionId) {
    return { ok: false as const, error: "session_mismatch" };
  }
  if (purchase.sku !== input.metadataSku) {
    return { ok: false as const, error: "sku_mismatch" };
  }
  if (input.metadataWallet && purchase.wallet !== input.metadataWallet.toLowerCase()) {
    return { ok: false as const, error: "wallet_mismatch" };
  }
  if (input.amountTotalCents != null && input.amountTotalCents !== purchase.amountUsdCents) {
    return { ok: false as const, error: "amount_mismatch" };
  }

  return { ok: true as const, purchase, skuEntry };
}
