import { motion } from "framer-motion";

import type { ProfileGamification } from "@/lib/profile/gamification";
import { cn } from "@/lib/utils";

const BADGE_TONES: Record<ProfileGamification["badges"][0]["tone"], string> = {
  lime: "border-[#C5FF41]/40 bg-[#C5FF41]/10 text-[#C5FF41]",
  cyan: "border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  purple: "border-purple-500/40 bg-purple-500/10 text-purple-200",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
};

export function ProfileGamificationBar({ gamification }: { gamification: ProfileGamification }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-black/40 p-5 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#C5FF41]/50 bg-[#C5FF41]/10 shadow-[0_0_24px_-6px_#C5FF41]">
            <span className="font-display text-xl font-bold text-[#C5FF41]">{gamification.level}</span>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Culture XP</p>
            <p className="font-display text-lg font-semibold text-white">
              {gamification.xp.toLocaleString()} XP
            </p>
            <p className="text-xs text-zinc-500">
              {gamification.xpInLevel.toLocaleString()} / {gamification.xpToNextLevel.toLocaleString()} to
              Level {gamification.level + 1}
            </p>
          </div>
        </div>
        <div className="flex min-w-[140px] flex-1 flex-wrap justify-end gap-2">
          {gamification.badges.map((b) => (
            <span
              key={b.id}
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                BADGE_TONES[b.tone],
              )}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${gamification.progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] via-[#C5FF41] to-[#C5FF41]"
        />
      </div>
    </motion.div>
  );
}
