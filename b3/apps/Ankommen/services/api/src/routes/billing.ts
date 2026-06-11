import type { FastifyPluginAsync } from "fastify";
import Stripe from "stripe";
import { prisma, PaymentProvider } from "@ankommen/database";
import { invalidateEntitlements } from "../lib/entitlements.js";
import { getBccBalanceHuman, verifyBccPaymentTx } from "@ankommen/chain";
import { z } from "zod";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const billingRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/subscription", async (request) => {
    return prisma.subscription.findFirst({
      where: { userId: request.user.sub, status: "ACTIVE" },
      include: { plan: true },
    });
  });

  app.post("/checkout", async (request, reply) => {
    if (!stripe) return reply.serviceUnavailable("Stripe not configured");

    const { planCode } = z.object({ planCode: z.string() }).parse(request.body);
    const plan = await prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan?.stripePriceId) {
      return reply.badRequest("Plan not available for Stripe checkout");
    }

    let user = await prisma.user.findUniqueOrThrow({ where: { id: request.user.sub } });
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      user = await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId!,
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/app/settings?success=1`,
      cancel_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/app/settings?canceled=1`,
      metadata: { userId: user.id, planCode: plan.code },
      subscription_data: {
        metadata: { userId: user.id, planCode: plan.code },
      },
    });

    return { url: session.url };
  });

  app.post("/pay-with-bcc", async (request, reply) => {
    const { planCode, txHash } = z
      .object({ planCode: z.string(), txHash: z.string().regex(/^0x[a-fA-F0-9]+$/) })
      .parse(request.body);

    const plan = await prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan?.bccRenewalPrice) {
      return reply.badRequest("Plan not available for BCC payment");
    }

    const wallet = await prisma.walletAccount.findFirst({
      where: { userId: request.user.sub, isPrimary: true },
    });
    if (!wallet) {
      return reply.badRequest("Link an Austria Chain wallet before paying with BCC");
    }

    const balance = await getBccBalanceHuman(wallet.address as `0x${string}`);
    if (balance < plan.bccRenewalPrice) {
      return reply.badRequest(`Insufficient BCC balance. Need ${plan.bccRenewalPrice} BCC.`);
    }

    const valid = await verifyBccPaymentTx(
      txHash as `0x${string}`,
      wallet.address as `0x${string}`,
      plan.bccRenewalPrice,
    );
    if (!valid) {
      return reply.badRequest("On-chain BCC payment not verified. Send BCC to treasury first.");
    }

    await prisma.subscription.updateMany({
      where: { userId: request.user.sub, status: "ACTIVE" },
      data: { status: "CANCELED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: request.user.sub,
        planId: plan.id,
        status: "ACTIVE",
        provider: PaymentProvider.BCC,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.payment.create({
      data: {
        userId: request.user.sub,
        subscriptionId: subscription.id,
        amount: plan.bccRenewalPrice,
        currency: "BCC",
        provider: PaymentProvider.BCC,
        providerRef: txHash,
        status: "succeeded",
        bccAmount: plan.bccRenewalPrice,
        bccTxHash: txHash,
        settlementStatus: "CONFIRMED",
        exchangeRate: `${plan.bccRenewalPrice} BCC = 1 month ${plan.name}`,
      },
    });

    await invalidateEntitlements(request.user.sub);

    return { subscription, txHash };
  });
};
