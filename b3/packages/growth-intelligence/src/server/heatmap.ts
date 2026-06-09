export type HeatmapCell = {
  gx: number;
  gy: number;
  count: number;
  intensity: number;
};

export type HeatmapPoint = {
  x: number;
  y: number;
  viewportW: number;
  viewportH: number;
};

const GRID = 24;

/** Bucket click coordinates into a normalized heatmap grid. */
export function buildClickHeatmap(
  points: HeatmapPoint[],
  gridSize = GRID,
): { cells: HeatmapCell[]; gridSize: number; maxCount: number } {
  const buckets = new Map<string, number>();

  for (const p of points) {
    if (!p.viewportW || !p.viewportH) continue;
    const nx = Math.min(0.999, Math.max(0, p.x / p.viewportW));
    const ny = Math.min(0.999, Math.max(0, p.y / p.viewportH));
    const gx = Math.floor(nx * gridSize);
    const gy = Math.floor(ny * gridSize);
    const key = `${gx},${gy}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const maxCount = Math.max(1, ...buckets.values());
  const cells: HeatmapCell[] = [];

  for (const [key, count] of buckets) {
    const [gx, gy] = key.split(",").map(Number);
    cells.push({
      gx: gx!,
      gy: gy!,
      count,
      intensity: Math.round((count / maxCount) * 1000) / 1000,
    });
  }

  cells.sort((a, b) => b.count - a.count);
  return { cells, gridSize, maxCount };
}
