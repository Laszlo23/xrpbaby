import type Stripe from "stripe";
import { prisma, SubscriptionStatus } from "@ankommen/database";
import { invalidateEntitlements } from "./entitlements.js";
import { settleBccForPayment } from "@ankommen/chain";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

export async function activateSubscriptionFromCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planCode = session.metadata?.planCode;
  if (!userId || !planCode) return;

  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) return;

  await prisma.subscription.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "CANCELED" },
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: "ACTIVE",
      provider: "STRIPE",
      stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
    },
  });

  const amount = session.amount_total ?? plan.priceMonthly;
  const payment = await prisma.payment.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      amount,
      currency: (session.currency ?? "eur").toUpperCase(),
      provider: "STRIPE",
      providerRef: typeof session.payment_intent === "string" ? session.payment_intent : session.id,
      status: "succeeded",
      settlementStatus: plan.bccGrantPerMonth || plan.bccGrantOnSignup ? "PENDING" : "NONE",
    },
  });

  if (plan.bccGrantPerMonth || plan.bccGrantOnSignup) {
    const bccAmount = (plan.bccGrantPerMonth ?? 0) + (plan.bccGrantOnSignup ?? 0);
    await settleBccForPayment({
      userId,
      paymentId: payment.id,
      bccAmount,
      exchangeRate: `${(amount / 100).toFixed(2)} EUR = ${bccAmount} BCC`,
    });
  }

  await invalidateEntitlements(userId);
}

export async function syncStripeSubscription(stripeSub: Stripe.Subscription) {
  const userId = stripeSub.metadata?.userId;
  if (!userId) return;

  const existing = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSub.id },
    include: { plan: true },
  });

  const status = mapStripeStatus(stripeSub.status);
  const firstItem = stripeSub.items?.data?.[0];
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000)
    : null;
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : null;

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
    await invalidateEntitlements(userId);
    return;
  }

  const planCode = stripeSub.metadata?.planCode ?? "PREMIUM";
  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) return;

  await prisma.subscription.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "CANCELED" },
  });

  await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status,
      provider: "STRIPE",
      stripeSubscriptionId: stripeSub.id,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });

  await invalidateEntitlements(userId);
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

export async function recordInvoicePayment(invoice: Stripe.Invoice) {
  if (invoice.status !== "paid" || !invoice.amount_paid) return;

  const stripeSubId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubId) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    include: { plan: true },
  });
  if (!subscription) return;

  const existing = invoice.id
    ? await prisma.payment.findFirst({ where: { providerRef: invoice.id } })
    : null;
  if (existing) return;

  const payment = await prisma.payment.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid,
      currency: (invoice.currency ?? "eur").toUpperCase(),
      provider: "STRIPE",
      providerRef: invoice.id,
      status: invoice.status === "paid" ? "succeeded" : "failed",
      settlementStatus: subscription.plan.bccGrantPerMonth ? "PENDING" : "NONE",
    },
  });

  if (subscription.plan.bccGrantPerMonth && invoice.billing_reason === "subscription_cycle") {
    await settleBccForPayment({
      userId: subscription.userId,
      paymentId: payment.id,
      bccAmount: subscription.plan.bccGrantPerMonth,
      exchangeRate: `${(invoice.amount_paid / 100).toFixed(2)} EUR = ${subscription.plan.bccGrantPerMonth} BCC`,
    });
  }
}

export async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const stripeSubId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubId },
    data: { status: "PAST_DUE" },
  });

  const subscription = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSubId } });
  if (subscription) await invalidateEntitlements(subscription.userId);
}
