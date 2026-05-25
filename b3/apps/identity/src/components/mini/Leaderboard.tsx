"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { useMiniApp } from "@/providers/MiniAppProvider";
import { levelFromXp } from "@/lib/mini/gamification";

type Entry = {
  fid: number;
  xp: number;
  level: number;
  rank: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

export function Leaderboard() {
  const { quickAuthFetch } = useMiniApp();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await quickAuthFetch("/api/mini/leaderboard");
      if (res.ok) {
        const data = (await res.json()) as { entries: Entry[] };
        setEntries(data.entries ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [quickAuthFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
      </div>
      <p className="text-sm text-muted-foreground">Top questers by XP</p>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No rankings yet. Complete quests to appear here.
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((e) => {
            const { title } = levelFromXp(e.xp);
            return (
              <li
                key={e.fid}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-3"
              >
                <span className="w-6 font-mono text-sm text-muted-foreground">
                  #{e.rank}
                </span>
                {e.pfpUrl ? (
                  <img
                    src={e.pfpUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {e.displayName ?? e.username ?? `fid:${e.fid}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{title}</p>
                </div>
                <p className="font-mono text-sm text-primary">{e.xp} XP</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
