/**
 * Seed merch drops from catalog.
 * Run: npx tsx prisma/seed-merch.ts
 */
import { PrismaClient } from "@prisma/client";

import { MERCH_DROPS } from "../src/content/marketplace-merch.ts";
import {
  ladderGrossAtCap,
  merchEditionCap,
  merchProductionTargetUsd,
} from "../src/lib/marketplace/merch-ladder.ts";

const prisma = new PrismaClient();

async function main() {
  const cap = merchEditionCap();
  const target = merchProductionTargetUsd();

  for (const entry of MERCH_DROPS) {
    await prisma.merchDrop.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        title: entry.title,
        imageUrl: entry.imageUrl,
        editionCap: cap,
        soldCount: 0,
        productionTargetUsd: target,
        status: "open",
      },
      update: {
        title: entry.title,
        imageUrl: entry.imageUrl,
        editionCap: cap,
        productionTargetUsd: target,
      },
    });
  }

  console.log(
    `Seeded ${MERCH_DROPS.length} merch drops (cap=${cap}, ladder gross=${ladderGrossAtCap(cap)}, target=${target}).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
