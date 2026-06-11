import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ status: "ok", service: "ankommen-api" }));

  app.get("/ready", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ready", database: "connected" };
    } catch {
      reply.status(503);
      return { status: "not_ready", database: "disconnected" };
    }
  });
};
