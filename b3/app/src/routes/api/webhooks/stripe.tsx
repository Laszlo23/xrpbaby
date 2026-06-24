import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";

import { getPackBySlug } from "@/lib/packs";
import {
  getStripeClient,
  isStripeConfigured,
  stripeWebhookSecret,
} from "@/server/billing/stripe-config";
import { enqueueBccSettlement } from "@/server/wallet/enqueue-bcc-settlement";
import { grantPackPurchase } from "@/server/wallet/grant-pack-purchase";

/**
 * Required Stripe webhook events:
 * - checkout.session.completed — pack, merch, api_purchase, service_order, culture_subscription
 * - checkout.session.expired — release pending merch / api_purchase / service_order holds
 * - customer.subscription.updated / deleted — sync Culture Monthly status
 * - invoice.payment_succeeded — monthly Culture Points on renewal
 */

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isStripeConfigured()) {
          return new Response("not configured", { status: 503 });
        }

        const webhookSecret = stripeWebhookSecret();
        if (!webhookSecret) {
          return new Response("not configured", { status: 503 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("missing signature", { status: 400 });
        }

        const rawBody = await request.text();
        const stripe = getStripeClient();
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch {
          return new Response("invalid signature", { status: 400 });
        }

        if (event.type === "checkout.session.expired") {
          return handleSessionExpired(event.data.object as Stripe.Checkout.Session);
        }

        if (event.type === "customer.subscription.updated") {
          const sub = event.data.object as Stripe.Subscription;
          const { upsertCultureSubscriptionFromStripe } =
            await import("@/server/billing/stripe-subscriptions");
          if (sub.metadata?.type === "culture_subscription") {
            const result = await upsertCultureSubscriptionFromStripe(sub);
            return jsonOk({ received: true, type: "culture_subscription", updated: result.ok });
          }
          return jsonOk({ received: true, skipped: "unknown_subscription" });
        }

        if (event.type === "customer.subscription.deleted") {
          const sub = event.data.object as Stripe.Subscription;
          const { markCultureSubscriptionCanceled } =
            await import("@/server/billing/stripe-subscriptions");
          if (sub.metadata?.type === "culture_subscription") {
            await markCultureSubscriptionCanceled(sub.id);
            return jsonOk({ received: true, type: "culture_subscription", canceled: true });
          }
          return jsonOk({ received: true, skipped: "unknown_subscription" });
        }

        if (event.type === "invoice.payment_succeeded") {
          const invoice = event.data.object as Stripe.Invoice;
          const { handleCultureSubscriptionInvoicePaid } =
            await import("@/server/billing/stripe-subscriptions");
          const result = await handleCultureSubscriptionInvoicePaid(invoice);
          return jsonOk({ received: true, type: "invoice", ...result });
        }

        if (event.type !== "checkout.session.completed") {
          return jsonOk({ received: true, skipped: "unhandled_event_type", type: event.type });
        }

        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === "culture_subscription" || session.mode === "subscription") {
          if (session.metadata?.type === "culture_subscription") {
            const { fulfillCultureSubscriptionCheckout } =
              await import("@/server/billing/stripe-subscriptions");
            const result = await fulfillCultureSubscriptionCheckout(session);
            return jsonOk({
              received: true,
              type: "culture_subscription",
              ...(result.ok ? result : { error: result.error }),
            });
          }
          return jsonOk({ received: true, skipped: "unknown_subscription_metadata" });
        }

        if (session.payment_status !== "paid") {
          return jsonOk({ received: true, skipped: "unpaid" });
        }

        const metaType = session.metadata?.type;

        if (metaType === "merch") {
          return handleMerchCompleted(session);
        }

        if (metaType === "api_purchase") {
          return handleApiPurchaseCompleted(session);
        }

        if (metaType === "service_order") {
          return handleServiceOrderCompleted(session);
        }

        if (session.metadata?.packSlug) {
          return handlePackCompleted(session);
        }

        console.warn("[stripe webhook] unknown metadata — skipping", {
          sessionId: session.id,
          metadata: session.metadata,
        });
        return jsonOk({ received: true, skipped: "unknown_metadata" });
      },
    },
  },
  component: () => null,
});

async function handleSessionExpired(session: Stripe.Checkout.Session) {
  const metaType = session.metadata?.type;
  if (!session.id) {
    return jsonOk({ received: true, expired: true });
  }

  if (metaType === "merch") {
    const { cancelMerchOrderByStripeSession } = await import("@/server/marketplace/merch-orders");
    await cancelMerchOrderByStripeSession(session.id);
  } else if (metaType === "api_purchase") {
    const { cancelStripeApiPurchaseBySession } =
      await import("@/server/billing/stripe-api-purchases");
    await cancelStripeApiPurchaseBySession(session.id);
  } else if (metaType === "service_order") {
    const { cancelServiceOrderByStripeSession } =
      await import("@/server/marketplace/service-orders");
    await cancelServiceOrderByStripeSession(session.id);
  }

  return jsonOk({ received: true, expired: true, type: metaType ?? "unknown" });
}

async function handleMerchCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId || !session.id) {
    return jsonOk({ received: true, type: "merch", error: "missing_metadata" });
  }

  const { verifyMerchStripeSession, markMerchOrderPaid } =
    await import("@/server/marketplace/merch-orders");

  const verified = await verifyMerchStripeSession({
    orderId,
    stripeSessionId: session.id,
    amountTotalCents: session.amount_total,
    metadataWallet: session.metadata?.wallet,
  });

  if (!verified.ok) {
    return jsonOk({
      received: true,
      type: "merch",
      error: verified.error,
      orderId,
    });
  }

  const paid = await markMerchOrderPaid({
    orderId,
    paymentRail: "stripe",
    stripeSessionId: session.id,
  });

  return jsonOk({
    received: true,
    type: "merch",
    alreadyPaid: paid.ok ? false : paid.error === "already_paid",
    orderId,
  });
}

async function handleApiPurchaseCompleted(session: Stripe.Checkout.Session) {
  const purchaseId = session.metadata?.purchaseId;
  const sku = session.metadata?.sku;
  const wallet = session.metadata?.wallet;
  if (!purchaseId || !session.id || !sku) {
    return jsonOk({ received: true, type: "api_purchase", error: "missing_metadata" });
  }

  const { verifyStripeApiSessionMetadata, markStripeApiPurchasePaid } =
    await import("@/server/billing/stripe-api-purchases");

  const verified = await verifyStripeApiSessionMetadata({
    purchaseId,
    stripeSessionId: session.id,
    amountTotalCents: session.amount_total,
    metadataSku: sku,
    metadataWallet: wallet,
  });

  if (!verified.ok) {
    return jsonOk({
      received: true,
      type: "api_purchase",
      error: verified.error,
      purchaseId,
    });
  }

  const paid = await markStripeApiPurchasePaid(session.id);
  return jsonOk({
    received: true,
    type: "api_purchase",
    purchaseId,
    sku,
    alreadyPaid: paid.ok ? paid.alreadyPaid : false,
  });
}

async function handleServiceOrderCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId || !session.id) {
    return jsonOk({ received: true, type: "service_order", error: "missing_metadata" });
  }

  const { verifyServiceStripeSession, markServiceOrderPaid, fulfillServiceOrderAfterPayment } =
    await import("@/server/marketplace/service-orders");

  const verified = await verifyServiceStripeSession({
    orderId,
    stripeSessionId: session.id,
    amountTotalCents: session.amount_total,
    metadataWallet: session.metadata?.wallet,
  });

  if (!verified.ok) {
    return jsonOk({
      received: true,
      type: "service_order",
      error: verified.error,
      orderId,
    });
  }

  const paid = await markServiceOrderPaid(orderId, {
    paymentRail: "stripe",
    stripeSessionId: session.id,
  });
  if (!paid.ok && paid.error !== "already_paid") {
    return jsonOk({
      received: true,
      type: "service_order",
      orderId,
      error: paid.error,
      alreadyPaid: false,
    });
  }

  const fulfillment = await fulfillServiceOrderAfterPayment(orderId);

  return jsonOk({
    received: true,
    type: "service_order",
    orderId,
    alreadyPaid: paid.ok ? false : paid.error === "already_paid",
    threadId: fulfillment.ok ? fulfillment.threadId : undefined,
  });
}

async function handlePackCompleted(session: Stripe.Checkout.Session) {
  const packSlug = session.metadata?.packSlug;
  const wallet = session.metadata?.wallet;
  const memberId = session.metadata?.memberId ?? session.client_reference_id;
  if (!packSlug || !wallet || !memberId || !session.id) {
    return jsonOk({ received: true, type: "pack", error: "missing_metadata" });
  }

  const pack = getPackBySlug(packSlug);
  if (!pack) {
    return jsonOk({ received: true, type: "pack", error: "unknown_pack", packSlug });
  }

  if (session.amount_total != null && session.amount_total !== pack.usdCents) {
    return jsonOk({
      received: true,
      type: "pack",
      error: "amount_mismatch",
      expectedCents: pack.usdCents,
      actualCents: session.amount_total,
    });
  }

  const { getPrisma } = await import("@/server/db/prisma");
  const prisma = getPrisma();
  if (!prisma) {
    return jsonOk({ received: true, type: "pack", error: "no_database" });
  }

  const { ensureWalletAndMember } = await import("@/server/platform/member");
  const { wallet: walletRow, member } = await ensureWalletAndMember(prisma, wallet);
  if (member.id !== memberId) {
    return jsonOk({ received: true, type: "pack", error: "member_mismatch" });
  }

  const result = await grantPackPurchase(prisma, {
    memberId: member.id,
    walletId: walletRow.id,
    pack,
    stripeSessionId: session.id,
  });

  const bccQueue = await enqueueBccSettlement(prisma, {
    memberId: member.id,
    walletId: walletRow.id,
    pack,
    stripeSessionId: session.id,
  });

  return jsonOk({
    received: true,
    type: "pack",
    alreadyGranted: result.alreadyGranted,
    pointsGranted: result.pointsGranted,
    bccSettlementQueued: !bccQueue.alreadyQueued,
  });
}

function jsonOk(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
