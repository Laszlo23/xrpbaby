import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";
import { getEntitlements } from "../lib/entitlements.js";

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      include: {
        profile: true,
        languagePref: true,
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
        },
      },
    });
    if (!user) {
      throw app.httpErrors.notFound("User not found");
    }
    const { subscriptions, ...rest } = user;
    return {
      ...rest,
      subscription: subscriptions[0] ?? null,
    };
  });

  app.get("/entitlements", async (request) => {
    return getEntitlements(request.user.sub);
  });

  app.patch("/profile", async (request) => {
    const body = request.body as Record<string, unknown>;
    const profile = await prisma.profile.upsert({
      where: { userId: request.user.sub },
      update: body,
      create: { userId: request.user.sub, ...body },
    });
    return profile;
  });
};
