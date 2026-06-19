import type { PrismaClient } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getGrowthOverview(
  prisma: PrismaClient,
  appId: string,
  days = 7,
): Promise<{
  activeUsers: number;
  returningUsers: number;
  sessions: number;
  events: number;
  rageClicks: number;
  conversionRate: number | null;
  topPages: { pathname: string; views: number }[];
}> {
  const since = new Date(Date.now() - days * DAY_MS);

  const [sessions, events, rageClicks, pageViews] = await Promise.all([
    prisma.growthSession.count({ where: { appId, startedAt: { gte: since } } }),
    prisma.growthEvent.count({ where: { appId, occurredAt: { gte: since } } }),
    prisma.growthEvent.count({
      where: { appId, kind: "rage_click", occurredAt: { gte: since } },
    }),
    prisma.growthEvent.groupBy({
      by: ["pathname"],
      where: { appId, kind: "page_view", occurredAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const sessionRows = await prisma.growthSession.findMany({
    where: { appId, startedAt: { gte: since } },
    select: { anonymousId: true },
  });
  const counts = new Map<string, number>();
  for (const s of sessionRows) {
    counts.set(s.anonymousId, (counts.get(s.anonymousId) ?? 0) + 1);
  }
  const returningUsers = [...counts.values()].filter((c) => c > 1).length;
  const activeUsers = counts.size;

  const walletConnects = await prisma.growthEvent.count({
    where: {
      appId,
      occurredAt: { gte: since },
      selector: { contains: "connect", mode: "insensitive" },
    },
  });

  const conversionRate = sessions > 0 ? Math.round((walletConnects / sessions) * 1000) / 10 : null;

  return {
    activeUsers,
    returningUsers,
    sessions,
    events,
    rageClicks,
    conversionRate,
    topPages: pageViews.map((p) => ({
      pathname: p.pathname,
      views: p._count.id,
    })),
  };
}
