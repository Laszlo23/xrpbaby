import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";

export const officeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/offices", async (request) => {
    const { city, category } = request.query as { city?: string; category?: string };
    return prisma.governmentOffice.findMany({
      where: {
        isActive: true,
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    });
  });

  app.get("/ngos", async (request) => {
    const { city, category } = request.query as { city?: string; category?: string };
    return prisma.nGO.findMany({
      where: {
        isActive: true,
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    });
  });

  app.get("/categories", async () => {
    return prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } });
  });
};
