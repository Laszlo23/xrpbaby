import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";
import { nanoid } from "nanoid";
import { z } from "zod";

export const referralRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", async (request) => {
    const body = z.object({ platform: z.string().default("farcaster"), userId: z.string().optional() }).parse(request.body ?? {});
    const code = nanoid(8).toUpperCase();
    return prisma.referral.create({
      data: { code, platform: body.platform, userId: body.userId },
    });
  });

  app.get("/:code", async (request, reply) => {
    const { code } = request.params as { code: string };
    const referral = await prisma.referral.findUnique({ where: { code: code.toUpperCase() } });
    if (!referral) return reply.notFound();
    return referral;
  });

  app.post("/:code/use", async (request, reply) => {
    const { code } = request.params as { code: string };
    const referral = await prisma.referral.findUnique({ where: { code: code.toUpperCase() } });
    if (!referral) return reply.notFound();
    return prisma.referral.update({
      where: { id: referral.id },
      data: { usageCount: { increment: 1 } },
    });
  });
};
