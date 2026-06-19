type Cell = { gx: number; gy: number; count: number; intensity: number };

export function ClickHeatmap({
  cells,
  gridSize,
  totalClicks,
  pathname,
}: {
  cells: Cell[];
  gridSize: number;
  totalClicks: number;
  pathname: string;
}) {
  if (totalClicks === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-500">
        No click data for <span className="font-mono text-zinc-400">{pathname}</span> yet. Enable
        the SDK to populate heatmaps.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1419] p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
        <span className="font-mono text-cyan-200/80">{pathname}</span>
        <span>{totalClicks} clicks</span>
      </div>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/5 bg-[#111820]"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {cells.map((cell) => (
          <div
            key={`${cell.gx}-${cell.gy}`}
            title={`${cell.count} clicks`}
            style={{
              gridColumn: cell.gx + 1,
              gridRow: cell.gy + 1,
              backgroundColor: `rgba(34, 211, 238, ${0.15 + cell.intensity * 0.75})`,
              boxShadow:
                cell.intensity > 0.5
                  ? `0 0 ${8 + cell.intensity * 12}px rgba(34,211,238,0.35)`
                  : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
