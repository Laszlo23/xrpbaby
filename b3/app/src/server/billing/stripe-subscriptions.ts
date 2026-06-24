import type Stripe from "stripe";

import { getPackBySlug } from "@/lib/packs";
import { creditPointsIdempotent } from "@/server/points/credit-idempotent";
import { getPrisma } from "@/server/db/prisma";
import { ensureWalletAndMember } from "@/server/platform/member";
import {
  formatOfferPrice,
  resolveCultureMonthlyOffer,
} from "@/server/billing/stripe-subscription-config";
import {
  getStripeClient,
  isStripeConfigured,
  platformOrigin,
} from "@/server/billing/stripe-config";

const SUBSCRIPTION_TYPE = "culture_subscription";
const MONTHLY_PACK_SLUG = "pack_7";

/** Stripe v18+ exposes billing period end on subscription items, not the subscription root. */
function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const endSec = subscription.items.data[0]?.current_period_end;
  return endSec ? new Date(endSec * 1000) : null;
}

/** Stripe v18+ nests subscription id under invoice.parent.subscription_details. */
function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return null;
}

export function subscriptionMetadataType(): string {
  return SUBSCRIPTION_TYPE;
}

export async function createCultureMonthlyCheckout(input: {
  walletAddress: string;
  returnPath?: string;
  email?: string;
}) {
  if (!isStripeConfigured()) {
    return { ok: false as const, error: "stripe_not_configured" };
  }

  const wallet = input.walletAddress.toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(wallet)) {
    return { ok: false as const, error: "invalid_wallet" };
  }

  const resolved = await resolveCultureMonthlyOffer();
  if (!resolved.ok) {
    return { ok: false as const, error: resolved.error };
  }

  const { offer } = resolved;
  const stripe = getStripeClient();
  const origin = platformOrigin();
  const returnPath = input.returnPath?.startsWith("/") ? input.returnPath : "/billing";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    line_items: [{ price: offer.priceId, quantity: 1 }],
    metadata: {
      type: SUBSCRIPTION_TYPE,
      wallet,
      productId: offer.productId,
      priceId: offer.priceId,
    },
    subscription_data: {
      metadata: {
        type: SUBSCRIPTION_TYPE,
        wallet,
        productId: offer.productId,
      },
    },
    success_url: `${origin}${returnPath}?checkout=subscription_success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${returnPath}?checkout=subscription_cancel`,
  });

  if (!session.url || !session.id) {
    return { ok: false as const, error: "no_checkout_url" };
  }

  return {
    ok: true as const,
    url: session.url,
    sessionId: session.id,
    productId: offer.productId,
    priceId: offer.priceId,
    label: offer.label,
    priceLabel: `${formatOfferPrice(offer)}/month`,
    currency: offer.currency,
  };
}

export async function getCultureSubscriptionForWallet(wallet: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return prisma.stripeMemberSubscription.findFirst({
    where: {
      wallet: wallet.toLowerCase(),
      status: { in: ["active", "trialing", "past_due"] },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function grantMonthlyCulturePoints(input: {
  memberId: string;
  walletId: string;
  stripeInvoiceId: string;
  stripeSubscriptionId: string;
}) {
  const pack = getPackBySlug(MONTHLY_PACK_SLUG);
  if (!pack) return { granted: false as const, reason: "pack_not_found" as const, points: 0 };

  const prisma = getPrisma();
  if (!prisma) return { granted: false as const, reason: "no_database" as const, points: 0 };

  const credit = await prisma.$transaction(async (tx) =>
    creditPointsIdempotent(tx, {
      walletId: input.walletId,
      delta: pack.culturePoints,
      reason: "subscription_renewal",
      taskSlug: MONTHLY_PACK_SLUG,
      idempotencyKey: `subscription:${input.stripeInvoiceId}`,
      metadata: {
        packSlug: MONTHLY_PACK_SLUG,
        stripeInvoiceId: input.stripeInvoiceId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        usdEquivalent: pack.usd,
      },
    }),
  );

  return {
    granted: credit.credited,
    reason: credit.alreadyCredited ? ("already_granted" as const) : undefined,
    points: pack.culturePoints,
  };
}

export async function upsertCultureSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  walletFromMetadata?: string,
) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const wallet = (walletFromMetadata ?? subscription.metadata?.wallet ?? "").toLowerCase();
  if (!wallet || !/^0x[a-f0-9]{40}$/.test(wallet)) {
    return { ok: false as const, error: "invalid_wallet" };
  }

  const priceId =
    typeof subscription.items.data[0]?.price.id === "string"
      ? subscription.items.data[0].price.id
      : "";
  const productId =
    typeof subscription.items.data[0]?.price.product === "string"
      ? subscription.items.data[0].price.product
      : (subscription.metadata?.productId ?? "");

  const { member, wallet: walletRow } = await ensureWalletAndMember(prisma, wallet);
  const periodEnd = subscriptionPeriodEnd(subscription);

  const row = await prisma.stripeMemberSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      memberId: member.id,
      wallet,
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      productId,
      status: subscription.status,
      currentPeriodEnd: periodEnd,
    },
    update: {
      memberId: member.id,
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id,
      stripePriceId: priceId,
      productId,
      status: subscription.status,
      currentPeriodEnd: periodEnd,
    },
  });

  return { ok: true as const, subscription: row, memberId: member.id, walletId: walletRow.id };
}

export async function verifyCultureSubscriptionCheckoutAmount(session: Stripe.Checkout.Session) {
  if (session.amount_total == null) return { ok: true as const };
  const resolved = await resolveCultureMonthlyOffer();
  if (!resolved.ok) return { ok: false as const, error: resolved.error };
  if (session.amount_total !== resolved.offer.amountCents) {
    return { ok: false as const, error: "amount_mismatch" };
  }
  return { ok: true as const };
}

export async function fulfillCultureSubscriptionCheckout(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") {
    return { ok: false as const, error: "not_subscription_session" };
  }

  const amountCheck = await verifyCultureSubscriptionCheckoutAmount(session);
  if (!amountCheck.ok) return amountCheck;

  const paid =
    session.payment_status === "paid" ||
    (session.status === "complete" && Boolean(session.subscription));
  if (!paid) {
    return { ok: false as const, error: "unpaid" };
  }

  const stripe = getStripeClient();
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!subscriptionId) {
    return { ok: false as const, error: "missing_subscription" };
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const wallet = session.metadata?.wallet;
  const upserted = await upsertCultureSubscriptionFromStripe(subscription, wallet);
  if (!upserted.ok) return upserted;

  const invoiceId =
    typeof session.invoice === "string" ? session.invoice : (session.invoice?.id ?? session.id);

  const points = await grantMonthlyCulturePoints({
    memberId: upserted.memberId,
    walletId: upserted.walletId,
    stripeInvoiceId: invoiceId,
    stripeSubscriptionId: subscriptionId,
  });

  return {
    ok: true as const,
    subscriptionId,
    wallet: subscription.metadata?.wallet ?? wallet,
    status: subscription.status,
    pointsGranted: points.granted ? points.points : 0,
    alreadyGranted: !points.granted && points.reason === "already_granted",
  };
}

export async function handleCultureSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId || !invoice.id) {
    return { ok: true as const, skipped: true };
  }

  if (
    invoice.billing_reason !== "subscription_cycle" &&
    invoice.billing_reason !== "subscription_create"
  ) {
    return { ok: true as const, skipped: true, reason: invoice.billing_reason };
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const upserted = await upsertCultureSubscriptionFromStripe(subscription);
  if (!upserted.ok) return upserted;

  if (invoice.billing_reason === "subscription_create") {
    return { ok: true as const, skipped: true, reason: "handled_by_checkout" };
  }

  const points = await grantMonthlyCulturePoints({
    memberId: upserted.memberId,
    walletId: upserted.walletId,
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subscriptionId,
  });

  return {
    ok: true as const,
    subscriptionId,
    pointsGranted: points.granted ? points.points : 0,
    alreadyGranted: !points.granted && points.reason === "already_granted",
  };
}

export async function markCultureSubscriptionCanceled(stripeSubscriptionId: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "no_database" };

  const existing = await prisma.stripeMemberSubscription.findUnique({
    where: { stripeSubscriptionId },
  });
  if (!existing) return { ok: true as const, skipped: true };

  await prisma.stripeMemberSubscription.update({
    where: { stripeSubscriptionId },
    data: { status: "canceled" },
  });

  return { ok: true as const, subscriptionId: stripeSubscriptionId };
}

export async function buildCultureSubscriptionManifestEntry(): Promise<{
  id: string;
  label: string;
  productId: string;
  priceId?: string;
  priceLabel: string;
  currency?: string;
  interval: "month";
  checkoutPath: string;
  culturePointsPerMonth: number;
} | null> {
  if (!isStripeConfigured()) return null;

  try {
    const resolved = await resolveCultureMonthlyOffer();
    if (!resolved.ok) return null;
    const pack = getPackBySlug(MONTHLY_PACK_SLUG);
    return {
      id: "culture_monthly",
      label: resolved.offer.label,
      productId: resolved.offer.productId,
      priceId: resolved.offer.priceId,
      priceLabel: `${formatOfferPrice(resolved.offer)}/month`,
      currency: resolved.offer.currency,
      interval: "month",
      checkoutPath: "/api/billing/stripe/subscribe",
      culturePointsPerMonth: pack?.culturePoints ?? 798,
    };
  } catch {
    return null;
  }
}
