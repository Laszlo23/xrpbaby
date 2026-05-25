"use client";

import { levelFromXp, xpProgressPercent } from "@/lib/mini/gamification";
import { Progress } from "@/components/ui/progress";

export function XpBar({ xp }: { xp: number }) {
  const { level, title, xpToNext } = levelFromXp(xp);
  const pct = xpProgressPercent(xp);

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Level {level}
          </p>
          <p className="text-lg font-semibold">{title}</p>
        </div>
        <p className="font-mono text-sm text-primary">{xp} XP</p>
      </div>
      <Progress value={pct} className="mt-3 h-2" />
      <p className="mt-2 text-xs text-muted-foreground">
        {xpToNext > 0 ? `${xpToNext} XP to next level` : "Max level reached"}
      </p>
    </div>
  );
}
