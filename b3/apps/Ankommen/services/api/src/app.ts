import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";
import { meRoutes } from "./routes/me.js";
import { conversationRoutes } from "./routes/conversations.js";
import { documentRoutes } from "./routes/documents.js";
import { benefitRoutes } from "./routes/benefits.js";
import { housingRoutes } from "./routes/housing.js";
import { officeRoutes } from "./routes/offices.js";
import { billingRoutes } from "./routes/billing.js";
import { billingWebhookRoutes } from "./routes/billing-webhook.js";
import { identityRoutes } from "./routes/identity.js";
import { adminRoutes } from "./routes/admin.js";
import { gdprRoutes } from "./routes/gdpr.js";
import { onboardingRoutes } from "./routes/onboarding.js";
import { mobileBillingRoutes } from "./routes/mobile-billing.js";
import { referralRoutes } from "./routes/referrals.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: string; isGuest?: boolean; type?: string };
    user: { sub: string; role: string; isGuest?: boolean };
  }
}

export async function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "production",
  });

  await app.register(sensible);
  await app.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
    credentials: true,
  });

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const mod = await import("ioredis");
    const Client = mod.default as unknown as new (url: string) => object;
    await app.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      redis: new Client(redisUrl) as never,
      nameSpace: "ankommen-ratelimit-",
    });
  } else {
    await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  }

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-in-production-min-32-chars",
  });

  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.unauthorized("Invalid or missing token");
    }
  });

  app.decorate("requireRole", (roles: string[]) => {
    return async (request: any, reply: any) => {
      if (!request.user || !roles.includes(request.user.role)) {
        reply.forbidden("Insufficient permissions");
      }
    };
  });

  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(meRoutes, { prefix: "/me" });
  await app.register(onboardingRoutes, { prefix: "/me/onboarding" });
  await app.register(conversationRoutes, { prefix: "/conversations" });
  await app.register(documentRoutes, { prefix: "/documents" });
  await app.register(benefitRoutes, { prefix: "/benefit-checks" });
  await app.register(housingRoutes, { prefix: "/housing-searches" });
  await app.register(officeRoutes, { prefix: "" });
  await app.register(billingWebhookRoutes, { prefix: "/billing" });
  await app.register(billingRoutes, { prefix: "/billing" });
  await app.register(identityRoutes, { prefix: "/identity" });
  await app.register(adminRoutes, { prefix: "/admin" });
  await app.register(gdprRoutes, { prefix: "/me" });
  await app.register(mobileBillingRoutes, { prefix: "/billing/mobile" });
  await app.register(referralRoutes, { prefix: "/referrals" });

  return app;
}
