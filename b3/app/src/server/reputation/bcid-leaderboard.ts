import { getPrisma } from "@/server/db/prisma";

export type BcidLeaderboardEntry = {
  rank: number;
  did: string;
  publicHandle: string | null;
  cultureHandle: string | null;
  builderScore: number;
  trust: number;
  contribution: number;
  verification: number;
};

export async function fetchBcidLeaderboard(limit = 100): Promise<BcidLeaderboardEntry[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const rows = await prisma.bcidIdentity.findMany({
    where: { type: "human" },
    include: { reputationScores: true, bridgeLink: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  const ranked = rows
    .map((row) => ({
      did: row.did,
      publicHandle: row.publicHandle,
      cultureHandle: row.bridgeLink?.cultureHandle ?? null,
      builderScore: row.reputationScores?.builder ?? 0,
      trust: row.reputationScores?.trust ?? 0,
      contribution: row.reputationScores?.contribution ?? 0,
      verification: row.reputationScores?.verification ?? 0,
    }))
    .sort((a, b) => b.builderScore - a.builderScore)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  return ranked;
}

export async function snapshotBcidLeaderboard(): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;

  const entries = await fetchBcidLeaderboard(100);
  const snapshotAt = new Date();

  await prisma.bcidLeaderboardSnapshot.deleteMany({
    where: { snapshotAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });

  for (const entry of entries) {
    await prisma.bcidLeaderboardSnapshot.create({
      data: {
        did: entry.did,
        publicHandle: entry.publicHandle,
        builderScore: entry.builderScore,
        rank: entry.rank,
        snapshotAt,
      },
    });
  }

  return entries.length;
}
