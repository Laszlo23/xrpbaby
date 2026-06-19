import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

import { getLevel } from "@/components/LevelBadge";
import type { ForestMemberSummary } from "@/hooks/useForestMemberTasks";
import { WalletIdentityBar } from "@/components/identity/WalletIdentityBar";

type Props = {
  summary: ForestMemberSummary;
  address: string;
};

export function ForestStatsHeader({ summary, address }: Props) {
  const lvl = getLevel(summary.culturePoints);
  const pct = Math.min(100, Math.round(lvl.progress));

  return (
    <header className="rounded-2xl border border-[#C5FF41]/20 bg-zinc-950/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C5FF41]/15">
            <Sprout className="h-6 w-6 text-[#C5FF41]" />
          </div>
          <div>
            <p className="mono-label !text-zinc-500">Your dashboard</p>
            <p className="font-display text-lg font-semibold capitalize text-white">
              {summary.forestStage} · {summary.supporterTier}
            </p>
            <p className="text-xs text-zinc-500">
              Lv{lvl.level} {lvl.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-[#C5FF41]">{summary.culturePoints}</p>
          <p className="text-xs text-zinc-500">Culture Points</p>
          {summary.checkInStreak != null && summary.checkInStreak > 0 ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#00E5FF]">
              {summary.checkInStreak} day streak
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-[#C5FF41] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <WalletIdentityBar className="!justify-start" />
        <Link
          to="/profile"
          className="text-xs text-[#C5FF41] underline underline-offset-2 hover:text-white"
        >
          Full profile & ledger →
        </Link>
      </div>
    </header>
  );
}
