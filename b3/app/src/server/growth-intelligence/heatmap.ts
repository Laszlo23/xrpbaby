import type { PrismaClient } from "@prisma/client";
import { buildClickHeatmap, type HeatmapCell } from "@bc/growth-intelligence/server";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function computeClickHeatmap(
  prisma: PrismaClient,
  appId: string,
  pathname: string,
  days = 7,
): Promise<{ pathname: string; cells: HeatmapCell[]; gridSize: number; totalClicks: number }> {
  const since = new Date(Date.now() - days * DAY_MS);

  const events = await prisma.growthEvent.findMany({
    where: {
      appId,
      pathname,
      kind: { in: ["click", "rage_click"] },
      occurredAt: { gte: since },
      x: { not: null },
      y: { not: null },
    },
    select: { x: true, y: true, viewportW: true, viewportH: true },
    take: 10000,
  });

  const points = events
    .filter((e) => e.x != null && e.y != null && e.viewportW && e.viewportH)
    .map((e) => ({
      x: e.x!,
      y: e.y!,
      viewportW: e.viewportW!,
      viewportH: e.viewportH!,
    }));

  const { cells, gridSize } = buildClickHeatmap(points);
  return { pathname, cells, gridSize, totalClicks: points.length };
}
