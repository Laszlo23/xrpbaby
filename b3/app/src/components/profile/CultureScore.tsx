import { GlassCard, SectionHeading, StatusBadge } from "@/components/profile/profile-ui";
import type { CultureScoreDimension, CultureScoreRank } from "@/lib/profile/founder-showcase";

type CultureScoreProps = {
  score: number;
  note: string;
  rank: CultureScoreRank;
  explanation: string;
  dimensions: CultureScoreDimension[];
};

export function CultureScore({
  score,
  note,
  rank,
  explanation,
  dimensions,
}: CultureScoreProps) {
  const rankLabel =
    rank.rank != null ? `Rank #${rank.rank} · ${rank.label}` : rank.label;

  return (
    <section className="space-y-5">
      <SectionHeading title="Culture Score" />
      <GlassCard hover={false} className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-4xl font-bold text-white tabular-nums">
              {score.toFixed(3)}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-zinc-500">{note}</p>
            <div className="mt-3">
              <StatusBadge label={rankLabel} tone="live" />
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">{explanation}</p>
        <ul className="space-y-3">
          {dimensions.map((dim) => (
            <li key={dim.id}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-zinc-300">{dim.label}</span>
                <span className="font-mono text-zinc-500">{dim.percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#C5FF41]"
                  style={{ width: `${dim.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}
