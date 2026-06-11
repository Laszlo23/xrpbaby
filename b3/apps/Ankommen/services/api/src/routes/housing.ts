import type { FastifyPluginAsync } from "fastify";
import { prisma, Prisma } from "@ankommen/database";
import { z } from "zod";

export const housingRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => {
    return prisma.housingSearch.findMany({
      where: { userId: request.user.sub },
      orderBy: { updatedAt: "desc" },
    });
  });

  app.post("/", async (request) => {
    const body = z
      .object({
        query: z.record(z.unknown()),
        results: z.array(z.unknown()).optional(),
        saved: z.boolean().optional(),
      })
      .parse(request.body);

    return prisma.housingSearch.create({
      data: {
        userId: request.user.sub,
        query: body.query as Prisma.InputJsonValue,
        results: (body.results ?? []) as Prisma.InputJsonValue,
        saved: body.saved ?? false,
      },
    });
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = z.object({ saved: z.boolean().optional(), results: z.array(z.unknown()).optional() }).parse(request.body);
    const existing = await prisma.housingSearch.findFirst({ where: { id, userId: request.user.sub } });
    if (!existing) return reply.notFound();
    return prisma.housingSearch.update({
      where: { id },
      data: {
        ...(body.saved !== undefined ? { saved: body.saved } : {}),
        ...(body.results ? { results: body.results as Prisma.InputJsonValue } : {}),
      },
    });
  });
};
