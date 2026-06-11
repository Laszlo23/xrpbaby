import type { FastifyPluginAsync } from "fastify";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { prisma, Role } from "@ankommen/database";
import { z } from "zod";

const guestSchema = z.object({
  deviceId: z.string().min(8).optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signTokens(app: any, user: { id: string; role: Role; isGuest: boolean }) {
  const accessToken = app.jwt.sign(
    { sub: user.id, role: user.role, isGuest: user.isGuest },
    { expiresIn: "7d" },
  );
  const refreshToken = app.jwt.sign(
    { sub: user.id, role: user.role, type: "refresh" },
    { expiresIn: "30d" },
  );
  return { accessToken, refreshToken };
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/guest", async (request) => {
    const body = guestSchema.parse(request.body ?? {});
    const deviceId = body.deviceId ?? nanoid(24);

    let user = await prisma.user.findUnique({ where: { guestDeviceId: deviceId } });
    if (!user) {
      const freePlan = await prisma.plan.findUniqueOrThrow({ where: { code: "FREE" } });
      user = await prisma.user.create({
        data: {
          isGuest: true,
          guestDeviceId: deviceId,
          name: "Guest",
          role: Role.USER,
          profile: { create: { preferredLang: "en" } },
          languagePref: {
            create: { interfaceLang: "en", chatLang: "en" },
          },
          subscriptions: {
            create: {
              planId: freePlan.id,
              status: "ACTIVE",
              provider: "MANUAL",
            },
          },
        },
      });
    }

    const tokens = signTokens(app, user);
    return { user: { id: user.id, name: user.name, isGuest: true }, ...tokens, deviceId };
  });

  app.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.conflict("Email already registered");
    }

    const freePlan = await prisma.plan.findUniqueOrThrow({ where: { code: "FREE" } });
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        isGuest: false,
        role: Role.USER,
        profile: { create: { preferredLang: "en" } },
        languagePref: { create: { interfaceLang: "en", chatLang: "en" } },
        subscriptions: {
          create: { planId: freePlan.id, status: "ACTIVE", provider: "MANUAL" },
        },
      },
    });

    const tokens = signTokens(app, user);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return reply.unauthorized("Invalid credentials");
    }
    const tokens = signTokens(app, user);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  });

  app.post("/refresh", async (request, reply) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(request.body);
    try {
      const payload = app.jwt.verify(refreshToken) as { sub: string; role: string; type?: string };
      if (payload.type !== "refresh") {
        return reply.unauthorized("Invalid refresh token");
      }
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        return reply.unauthorized("User not found");
      }
      const tokens = signTokens(app, user);
      return tokens;
    } catch {
      return reply.unauthorized("Invalid refresh token");
    }
  });

  app.post("/oauth/sync", { onRequest: [app.authenticate] }, async (request) => {
    const userId = request.user.sub;
    const body = z
      .object({
        email: z.string().email(),
        name: z.string().optional(),
        image: z.string().optional(),
        provider: z.string(),
        providerAccountId: z.string(),
      })
      .parse(request.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: body.email,
        name: body.name,
        image: body.image,
        isGuest: false,
      },
    });

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: body.provider,
          providerAccountId: body.providerAccountId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        type: "oauth",
        provider: body.provider,
        providerAccountId: body.providerAccountId,
      },
    });

    const tokens = signTokens(app, user);
    return { user, ...tokens };
  });
};
