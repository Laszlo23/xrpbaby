import { useEffect, useState } from "react";
import { tgLeaderboard, type TgLeaderboardResponse } from "@/lib/tg/api";

export function TgRankTab({ initDataRaw }: { initDataRaw: string | null }) {
  const [data, setData] = useState<TgLeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await tgLeaderboard(initDataRaw, 10);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res.data);
    })();
  }, [initDataRaw]);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-zinc-500">Loading board…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#C5FF41]/20 bg-[#141810] p-4 text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Your rank</p>
        <p className="mt-1 text-2xl font-bold text-[#C5FF41]">
          {data.you.rank ? `#${data.you.rank}` : "—"}
        </p>
        <p className="text-sm text-zinc-400">{data.you.points} XP</p>
        {data.you.xpBehindNext != null && data.you.xpBehindNext > 0 ? (
          <p className="mt-1 text-xs text-zinc-500">
            {data.you.xpBehindNext} XP behind the next spot
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Top growers</p>
        <ul className="space-y-2">
          {data.rows.map((row) => (
            <li
              key={`${row.rank}-${row.displayName}`}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                row.isYou ? "border-[#C5FF41]/40 bg-[#C5FF41]/5" : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 text-sm font-bold text-zinc-500">#{row.rank}</span>
                <span className="text-sm text-white">{row.displayName}</span>
                {row.isYou ? <span className="text-[10px] text-[#C5FF41]">you</span> : null}
              </div>
              <span className="text-xs text-zinc-400">{row.points} XP</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
