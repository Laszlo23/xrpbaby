import { getPrisma } from "@/server/db/prisma";

export type LeaderboardEntry = {
  rank: number;
  handle: string;
  score: number;
  ownerAddress: string;
};

/** Leaderboard among CultureIdentity rows with stored reputation snapshots or live enrichment. */
export async function getReputationLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const latestSnapshot = await prisma.reputationLeaderboardSnapshot.findFirst({
    orderBy: { snapshotAt: "desc" },
  });

  if (latestSnapshot) {
    const rows = await prisma.reputationLeaderboardSnapshot.findMany({
      where: { snapshotAt: latestSnapshot.snapshotAt },
      orderBy: { rank: "asc" },
      take: limit,
    });
    if (rows.length > 0) {
      return rows.map((r) => ({
        rank: r.rank,
        handle: r.handle,
        score: r.score,
        ownerAddress: "",
      }));
    }
  }

  const identities = await prisma.cultureIdentity.findMany({
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  return identities.map((id, i) => ({
    rank: i + 1,
    handle: id.handle,
    score: 0,
    ownerAddress: id.ownerAddress,
  }));
}

export async function snapshotLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  const prisma = getPrisma();
  if (!prisma || entries.length === 0) return;
  const snapshotAt = new Date();
  await prisma.reputationLeaderboardSnapshot.createMany({
    data: entries.map((e) => ({
      handle: e.handle,
      score: e.score,
      rank: e.rank,
      snapshotAt,
    })),
  });
}
