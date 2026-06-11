import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";

export const gdprRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.post("/export", async (request) => {
    const userId = request.user.sub;
    const [user, profile, conversations, documents, benefitChecks] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.conversation.findMany({ where: { userId }, include: { messages: true } }),
      prisma.uploadedDocument.findMany({ where: { userId }, include: { analysis: true } }),
      prisma.benefitCheck.findMany({ where: { userId } }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      user,
      profile,
      conversations,
      documents: documents.map(({ s3Key, ...rest }) => rest),
      benefitChecks,
    };
  });

  app.delete("/account", async (request, reply) => {
    await prisma.user.update({
      where: { id: request.user.sub },
      data: { deletedAt: new Date(), email: null },
    });
    await prisma.user.delete({ where: { id: request.user.sub } }).catch(() => {});
    return reply.send({ deleted: true });
  });

  app.patch("/ai-memory", async (request) => {
    const { enabled } = request.body as { enabled: boolean };
    return prisma.profile.update({
      where: { userId: request.user.sub },
      data: { aiMemoryEnabled: enabled },
    });
  });

  app.patch("/analytics", async (request) => {
    const { optOut } = request.body as { optOut: boolean };
    return prisma.profile.update({
      where: { userId: request.user.sub },
      data: { analyticsOptOut: optOut },
    });
  });
};
