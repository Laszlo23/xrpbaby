import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

import { PrismaClient } from "@/generated/prisma/client";

export function createBunPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBunSqlite({ url });
  return new PrismaClient({ adapter });
}
