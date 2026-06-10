import { Link } from "@tanstack/react-router";
import { getRootsCountdown } from "@/lib/roots-config";

type Props = {
  compact?: boolean;
};

export function CultureRootsCountdown({ compact = false }: Props) {
  const { daysRemaining, hoursRemaining, isPast, percentElapsed, unlockAt } = getRootsCountdown();
  const barPct = Math.max(2, Math.min(100, percentElapsed));

  return (
    <div
      className={`rounded-xl border border-emerald-500/20 bg-emerald-500/5 ${compact ? "p-3" : "p-4 mt-4"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">
          Root Season
        </p>
        <span className="font-mono text-xs text-zinc-300">
          {isPast ? "Unlock window open" : `${daysRemaining}d · ${hoursRemaining}h`}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500/80 to-[#C5FF41] transition-all duration-500"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        {isPast ? (
          <>
            Treasury participation is live — plant BCC roots on{" "}
            <Link to="/roots" className="text-[#C5FF41] underline underline-offset-2">
              Culture Roots
            </Link>
            . Rewards stream from protocol allocation, not inflation.
          </>
        ) : (
          <>
            Target unlock ~{unlockAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            . The treasury shares growth with builders who stake — not a guaranteed return.{" "}
            <Link to="/roots" className="text-[#C5FF41] underline underline-offset-2">
              Learn more
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
