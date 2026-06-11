import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);
  app.addHook("onRequest", app.requireRole(["ADMIN"]));

  app.get("/stats", async () => {
    const [users, subscriptions, messages, documents] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.message.count({ where: { role: "assistant" } }),
      prisma.uploadedDocument.count(),
    ]);
    return { users, activeSubscriptions: subscriptions, aiMessages: messages, documents };
  });

  app.get("/users", async () => {
    return prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, isGuest: true, createdAt: true },
    });
  });

  app.get("/questions", async () => {
    return prisma.message.groupBy({
      by: ["agentType"],
      where: { role: "user" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
  });

  app.post("/knowledge", async (request) => {
    const body = request.body as { title: string; url?: string; content: string; isVerified?: boolean };
    return prisma.knowledgeSource.create({
      data: {
        title: body.title,
        url: body.url,
        content: body.content,
        isVerified: body.isVerified ?? true,
        sourceType: "admin",
      },
    });
  });

  app.get("/knowledge", async () => {
    return prisma.knowledgeSource.findMany({
      where: { parentId: null },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
  });

  app.post("/offices", async (request) => {
    const body = request.body as Record<string, unknown>;
    return prisma.governmentOffice.create({ data: body as any });
  });

  app.post("/logs", async (request) => {
    await prisma.adminLog.create({
      data: {
        adminId: request.user.sub,
        action: (request.body as { action: string }).action,
        target: (request.body as { target?: string }).target,
        metadata: request.body as object,
      },
    });
    return { ok: true };
  });
};
