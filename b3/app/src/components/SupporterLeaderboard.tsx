import { useEffect, useState } from "react";

type Row = {
  address: string | null;
  displayName?: string | null;
  farcasterUsername?: string | null;
  supportScore?: number;
  points?: number;
};

export function SupporterLeaderboard({ className = "" }: { className?: string }) {
  const [sort, setSort] = useState<"support" | "points">("support");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void fetch(`/api/member/leaderboard?sort=${sort}&limit=10`)
      .then((r) => r.json())
      .then((json: { rows?: Row[] }) => setRows(json.rows ?? []))
      .catch(() => setRows([]));
  }, [sort]);

  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-white">Community supporters</h2>
        <div className="flex gap-1 rounded-full border border-white/10 p-0.5">
          <button
            type="button"
            onClick={() => setSort("support")}
            className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wider ${
              sort === "support" ? "bg-white/15 text-white" : "text-zinc-500"
            }`}
          >
            Support
          </button>
          <button
            type="button"
            onClick={() => setSort("points")}
            className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wider ${
              sort === "points" ? "bg-white/15 text-white" : "text-zinc-500"
            }`}
          >
            Points
          </button>
        </div>
      </div>
      <ol className="space-y-2">
        {rows.map((row, i) => (
          <li
            key={`${row.address ?? i}-${sort}`}
            className="flex items-center justify-between rounded-xl border border-white/8 bg-black/30 px-4 py-3"
          >
            <div>
              <span className="mr-2 font-mono text-xs text-zinc-600">{i + 1}</span>
              <span className="text-sm text-zinc-200">
                {row.farcasterUsername
                  ? `@${row.farcasterUsername}`
                  : (row.displayName ?? "Builder")}
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums text-[#C5FF41]">
              {sort === "support" ? (row.supportScore ?? 0) : (row.points ?? 0)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
