import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

async function createPrismaClient(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  if (typeof Bun !== "undefined") {
    const { createBunPrismaClient } = await import("./db-bun.server");
    globalForPrisma.prisma = createBunPrismaClient();
    return globalForPrisma.prisma;
  }

  const { createNodePrismaClient } = await import("./db-node.server");
  globalForPrisma.prisma = createNodePrismaClient();
  return globalForPrisma.prisma;
}

const prisma = await createPrismaClient();

export function getPrisma(): PrismaClient {
  return prisma;
}
