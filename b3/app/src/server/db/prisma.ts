/**
 * Server-only Prisma client. Do not import from client components.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
type PrismaClientType = import("@prisma/client").PrismaClient;
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientType;
  prismaUrl?: string;
};

export function getPrisma(): PrismaClientType | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (globalForPrisma.prisma && globalForPrisma.prismaUrl !== url) {
    void globalForPrisma.prisma.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaUrl = undefined;
  }

  if (!globalForPrisma.prisma) {
    try {
      // NOTE: Avoid static import so SSR bundlers don't inline Prisma internals.
      // Prisma is server-only; load it at runtime.
      const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
      globalForPrisma.prismaUrl = url;
    } catch (e) {
      console.warn("Prisma client init failed (invalid DATABASE_URL or missing native binary):", e);
      return null;
    }
  }
  return globalForPrisma.prisma;
}

function prismaSql() {
  return (require("@prisma/client") as typeof import("@prisma/client")).Prisma;
}

export async function queryWalletLeaderboard(
  prisma: PrismaClientType,
  limit: number,
): Promise<Array<{ address: string; points: number }>> {
  const { sql } = prismaSql();
  return prisma.$queryRaw<{ address: string; points: number }[]>(sql`
    SELECT w.address, COALESCE(SUM(pl.delta), 0)::int AS points
    FROM "Wallet" w
    INNER JOIN "PointLedger" pl ON pl."walletId" = w.id
    GROUP BY w.id, w.address
    ORDER BY points DESC
    LIMIT ${limit}
  `);
}

export async function queryReferralLeaderboard30d(
  prisma: PrismaClientType,
  limit: number,
): Promise<Array<{ address: string; points: number }>> {
  const { sql } = prismaSql();
  return prisma.$queryRaw<{ address: string; points: number }[]>(sql`
    SELECT w.address, COALESCE(SUM(pl.delta), 0)::int AS points
    FROM "Wallet" w
    INNER JOIN "PointLedger" pl ON pl."walletId" = w.id
    WHERE pl."taskSlug" = 'raffle-referral-bonus'
      AND pl."createdAt" > NOW() - INTERVAL '30 days'
    GROUP BY w.id, w.address
    ORDER BY points DESC
    LIMIT ${limit}
  `);
}
