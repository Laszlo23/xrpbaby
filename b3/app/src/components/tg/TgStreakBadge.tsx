import { Flame } from "lucide-react";

export function TgStreakBadge({ days }: { days: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1">
      <Flame className={`h-4 w-4 ${days > 0 ? "text-orange-400" : "text-zinc-600"}`} />
      <span className="text-sm font-semibold text-orange-200">{days}</span>
      <span className="text-xs text-zinc-500">day streak</span>
    </div>
  );
}
