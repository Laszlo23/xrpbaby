/**
 * Server-only Prisma client. Do not import from client components.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
type PrismaClientType = import("@prisma/client").PrismaClient;
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

export function getPrisma(): PrismaClientType | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!globalForPrisma.prisma) {
    // NOTE: Avoid static import so SSR bundlers don't inline Prisma internals.
    // Prisma is server-only; load it at runtime.
    const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}
