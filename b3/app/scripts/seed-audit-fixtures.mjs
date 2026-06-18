#!/usr/bin/env node
/**
 * Seed minimal audit fixtures for CI / local flow tests.
 * Usage: DATABASE_URL=... node app/scripts/seed-audit-fixtures.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FIXTURE_WALLET = "0x00000000000000000000000000000000000000a1";

async function main() {
  const wallet = await prisma.wallet.upsert({
    where: { address: FIXTURE_WALLET },
    create: { address: FIXTURE_WALLET },
    update: {},
  });
  await prisma.member.upsert({
    where: { walletId: wallet.id },
    create: { walletId: wallet.id },
    update: {},
  });
  console.log("Seeded audit fixture wallet:", FIXTURE_WALLET);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
