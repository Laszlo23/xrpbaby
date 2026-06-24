import { randomUUID } from "node:crypto";

import { formatUsdFromCents, getStripeApiSku } from "@/lib/billing/stripe-api-catalog";
import {
  createStripeApiPurchase,
  type StripePurchaseStatus,
} from "@/server/billing/stripe-api-purchases";
import {
  getStripeClient,
  isStripeConfigured,
  platformOrigin,
} from "@/server/billing/stripe-config";

export async function createApiCheckoutSession(input: {
  sku: string;
  wallet: string;
  returnPath?: string;
}) {
  if (!isStripeConfigured()) {
    return { ok: false as const, error: "stripe_not_configured" };
  }

  const skuEntry = getStripeApiSku(input.sku);
  if (!skuEntry) {
    return { ok: false as const, error: "unknown_sku" };
  }

  const stripe = getStripeClient();
  const origin = platformOrigin();
  const wallet = input.wallet.toLowerCase();

  const pending = await createStripeApiPurchase({
    sku: skuEntry.sku,
    wallet,
    amountUsdCents: skuEntry.usdCents,
    stripeSessionId: `pending_${randomUUID()}`,
    returnPath: input.returnPath,
  });

  if (!pending.ok) {
    return pending;
  }

  const purchaseId = pending.purchase.id;
  const returnPath = input.returnPath?.startsWith("/") ? input.returnPath : "/billing";
  const successUrl = `${origin}${returnPath}?checkout=success&stripe_purchase_id=${purchaseId}&sku=${encodeURIComponent(skuEntry.sku)}`;
  const cancelUrl = `${origin}${returnPath}?checkout=cancel&sku=${encodeURIComponent(skuEntry.sku)}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: skuEntry.usdCents,
          product_data: {
            name: skuEntry.label,
            description: `Single API call · ${skuEntry.method} ${skuEntry.apiPath}`,
          },
        },
      },
    ],
    metadata: {
      type: "api_purchase",
      purchaseId,
      sku: skuEntry.sku,
      wallet,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url || !session.id) {
    return { ok: false as const, error: "no_checkout_url" };
  }

  const { getPrisma } = await import("@/server/db/prisma");
  const prisma = getPrisma();
  if (prisma) {
    await prisma.stripeApiPurchase.update({
      where: { id: purchaseId },
      data: { stripeSessionId: session.id },
    });
  }

  return {
    ok: true as const,
    purchaseId,
    sku: skuEntry.sku,
    label: skuEntry.label,
    priceUsd: formatUsdFromCents(skuEntry.usdCents),
    url: session.url,
    sessionId: session.id,
    apiPath: skuEntry.apiPath,
    method: skuEntry.method,
  };
}

export type StripeCheckoutResult = Awaited<ReturnType<typeof createApiCheckoutSession>>;

export function isValidPurchaseStatus(status: string): status is StripePurchaseStatus {
  return (
    status === "pending_payment" ||
    status === "paid" ||
    status === "consumed" ||
    status === "expired" ||
    status === "cancelled"
  );
}
