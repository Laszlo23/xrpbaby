import { Link } from "@tanstack/react-router";
import { Lock, Check } from "lucide-react";
import type { CultureChronicle } from "@/content/culture-chronicles";
import type { ChronicleProgress } from "@/hooks/useChronicleProgress";

type Props = {
  chapters: CultureChronicle[];
  progress: ChronicleProgress;
};

const TIER_RING: Record<CultureChronicle["tier"], string> = {
  common: "ring-zinc-500/40",
  uncommon: "ring-cyan-500/40",
  rare: "ring-violet-500/50",
  legendary: "ring-[var(--vault-gold)]/60",
};

export function ChronicleLevelMap({ chapters, progress }: Props) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-3 px-1">
        {chapters.map((ch, idx) => {
          const owned = (progress.balances.get(ch.editionId) ?? 0n) > 0n;
          const priorOwned =
            ch.editionId === 1 ||
            progress.hasSkipKey ||
            (progress.balances.get(ch.editionId - 1) ?? 0n) > 0n;
          return (
            <div key={ch.id} className="flex items-center gap-3">
              <Link
                to="/chronicles/$chapterId"
                params={{ chapterId: ch.id }}
                className={`group relative flex w-28 flex-col items-center rounded-2xl border border-white/[0.08] bg-black/40 p-3 ring-2 ${TIER_RING[ch.tier]} transition hover:border-white/20`}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-zinc-900">
                  <img
                    src={ch.thumbSrc}
                    alt=""
                    className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = ch.bucketFallback;
                    }}
                  />
                  {owned ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Check className="h-6 w-6 text-emerald-400" aria-hidden />
                    </span>
                  ) : !priorOwned && ch.editionId > 1 ? (
                    <span className="absolute right-1 top-1 rounded bg-black/70 p-0.5">
                      <Lock className="h-3 w-3 text-zinc-400" aria-hidden />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                  Ch {ch.editionId}
                </p>
                <p className="mt-0.5 line-clamp-2 text-center text-[11px] font-medium leading-tight text-white">
                  {ch.title}
                </p>
              </Link>
              {idx < chapters.length - 1 ? (
                <div className="h-px w-6 bg-gradient-to-r from-zinc-700 to-zinc-800" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ProgressRingProps = {
  owned: number;
  total: number;
};

export function ChronicleProgressRing({ owned, total }: ProgressRingProps) {
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  const founder = owned >= total;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3">
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--vault-gold) ${pct}%, rgba(255,255,255,0.08) 0)`,
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-mono text-[11px] text-white">
          {owned}/{total}
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Set progress
        </p>
        <p className="font-heading text-sm font-semibold text-white">
          {founder ? "Chronicle Founder" : `${pct}% to full set`}
        </p>
        <p className="text-[11px] text-zinc-500">
          {founder
            ? "All 11 chapters owned — claim founder perks in Forest."
            : "Mint every chapter for the +500 pts founder bonus."}
        </p>
      </div>
    </div>
  );
}
