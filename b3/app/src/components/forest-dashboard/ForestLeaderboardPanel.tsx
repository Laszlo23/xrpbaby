import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import { AsyncSection, AsyncSectionSpinner } from "@/components/AsyncSection";

type Row = {
  address: string | null;
  displayName?: string | null;
  farcasterUsername?: string | null;
  points?: number;
};

export function ForestLeaderboardPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error" | "empty">("loading");

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const res = await fetch("/api/member/leaderboard?sort=points&limit=10");
      if (!res.ok) {
        setLoadState("error");
        return;
      }
      const json = (await res.json()) as { rows?: Row[] };
      const next = json.rows ?? [];
      setRows(next);
      setLoadState(next.length === 0 ? "empty" : "ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <aside className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 lg:sticky lg:top-28">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[#C5FF41]" />
        <h2 className="font-display text-base font-semibold text-white">Leaderboard</h2>
      </div>
      <p className="mt-1 text-xs text-zinc-500">Ranked by Culture Points</p>
      <AsyncSection
        className="mt-4"
        state={loadState}
        emptyMessage="No rankings yet — complete quests to climb the board."
        errorMessage="Leaderboard is temporarily unavailable."
        onRetry={() => void load()}
        skeleton={<AsyncSectionSpinner label="Loading rankings…" />}
      >
        <ol className="space-y-2">
          {rows.map((row, i) => (
            <li
              key={`${row.address ?? i}-pts`}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2"
            >
              <div className="min-w-0">
                <span className="mr-2 font-mono text-[10px] text-zinc-600">{i + 1}</span>
                <span className="truncate text-xs text-zinc-200">
                  {row.farcasterUsername
                    ? `@${row.farcasterUsername}`
                    : (row.displayName ?? "Builder")}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-[#C5FF41]">
                {row.points ?? 0} pts
              </span>
            </li>
          ))}
        </ol>
      </AsyncSection>
      <Link
        to="/leaderboard"
        className="mt-4 block text-center text-xs text-zinc-500 underline underline-offset-2 hover:text-[#C5FF41]"
      >
        Full leaderboard →
      </Link>
    </aside>
  );
}
