import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";
import { z } from "zod";

export const mobileBillingRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.post("/apple/verify", async (request, reply) => {
    const body = z.object({ receiptData: z.string(), productId: z.string() }).parse(request.body);
    if (!process.env.APPLE_IAP_SECRET) {
      return reply.serviceUnavailable("Apple IAP not configured");
    }

    const plan = await prisma.plan.findFirst({ where: { appleProductId: body.productId } });
    if (!plan) return reply.badRequest("Unknown product");

    await prisma.subscription.updateMany({
      where: { userId: request.user.sub, status: "ACTIVE" },
      data: { status: "CANCELED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: request.user.sub,
        planId: plan.id,
        status: "ACTIVE",
        provider: "APPLE",
        appleReceiptRef: body.receiptData.slice(0, 100),
      },
    });

    return { subscription, verified: true };
  });

  app.post("/google/verify", async (request, reply) => {
    const body = z
      .object({ purchaseToken: z.string(), productId: z.string(), packageName: z.string() })
      .parse(request.body);

    if (!process.env.GOOGLE_PLAY_BILLING_KEY) {
      return reply.serviceUnavailable("Google Play billing not configured");
    }

    const plan = await prisma.plan.findFirst({ where: { googleProductId: body.productId } });
    if (!plan) return reply.badRequest("Unknown product");

    await prisma.subscription.updateMany({
      where: { userId: request.user.sub, status: "ACTIVE" },
      data: { status: "CANCELED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: request.user.sub,
        planId: plan.id,
        status: "ACTIVE",
        provider: "GOOGLE",
        googlePurchaseToken: body.purchaseToken,
      },
    });

    return { subscription, verified: true };
  });
};
