/**
 * Batch refresh Support Scores for members with linked Farcaster FIDs.
 * Usage: DATABASE_URL=... NEYNAR_API_KEY=... tsx scripts/sync-support-scores.ts
 */
import { PrismaClient } from "@prisma/client";
import { syncMemberSupportScore } from "../src/server/social/support-score-sync.js";

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany({
    where: { OR: [{ farcasterFid: { not: null } }, { walletAddress: { not: null } }] },
    select: { id: true, farcasterFid: true },
    take: 500,
  });

  let updated = 0;
  for (const m of members) {
    try {
      await syncMemberSupportScore(prisma, m.id);
      updated += 1;
    } catch (e) {
      console.warn("skip", m.id, e instanceof Error ? e.message : e);
    }
  }
  console.log(`Synced support scores for ${updated}/${members.length} members`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
