import "dotenv/config";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import { PrismaClient } from "../src/generated/prisma/client";
import { ALL_DELIVERABLE_SEEDS } from "../src/lib/deliverables-data";
import { MISSION_SEEDS } from "../src/lib/missions-data";

const adapter = new PrismaBunSqlite({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const mission of MISSION_SEEDS) {
    await prisma.mission.upsert({
      where: { slug: mission.slug },
      create: mission,
      update: {
        title: mission.title,
        description: mission.description,
        xpReward: mission.xpReward,
        bccReward: mission.bccReward,
        nftAchievementKey: mission.nftAchievementKey ?? null,
        pathSlug: mission.pathSlug ?? null,
        sortOrder: mission.sortOrder,
      },
    });
  }

  for (const d of ALL_DELIVERABLE_SEEDS) {
    await prisma.deliverable.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        title: d.title,
        description: d.description,
        type: d.type,
        dayNumber: d.dayNumber,
        trackSlug: d.trackSlug ?? null,
        content: d.content,
        sortOrder: d.sortOrder,
      },
      update: {
        title: d.title,
        description: d.description,
        type: d.type,
        dayNumber: d.dayNumber,
        trackSlug: d.trackSlug ?? null,
        content: d.content,
        sortOrder: d.sortOrder,
      },
    });
  }

  console.log(`Seeded ${MISSION_SEEDS.length} missions, ${ALL_DELIVERABLE_SEEDS.length} deliverables`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
