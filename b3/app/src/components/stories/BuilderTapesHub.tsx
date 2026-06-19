"use client";

"use client";

import { Link } from "@tanstack/react-router";
import { Headphones, Play } from "lucide-react";

import {
  BUILDER_TAPES,
  BUILDER_TAPES_SERIES,
  builderTapeEpisodePath,
  countCompletedBuilderTapes,
} from "@/content/builder-tapes";
import { tapeListenRatio, readLocalTapeProgress } from "@/hooks/useBuilderTapeProgress";
import { cn } from "@/lib/utils";

type BuilderTapesHubProps = {
  completedSlugs?: string[];
  compact?: boolean;
  className?: string;
};

export function BuilderTapesHub({
  completedSlugs = [],
  compact = false,
  className,
}: BuilderTapesHubProps) {
  const heardCount = countCompletedBuilderTapes(completedSlugs);

  return (
    <div className={cn("space-y-6", className)}>
      {!compact ? (
        <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-6 py-10 md:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,255,65,0.06),transparent_60%)]" />
          <p className="relative font-mono text-[10px] uppercase tracking-[0.35em] text-[#C5FF41]">
            Layer 1 · Real stories
          </p>
          <h1 className="relative mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            {BUILDER_TAPES_SERIES.title}
          </h1>
          <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            {BUILDER_TAPES_SERIES.subtitle}
          </p>
          <p className="relative mt-4 font-mono text-[11px] uppercase tracking-wider text-[#00E5FF]">
            {heardCount}/{BUILDER_TAPES.length} episodes credited · {BUILDER_TAPES_SERIES.hubCta}
          </p>
        </header>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-white">
              {BUILDER_TAPES_SERIES.title}
            </p>
            <p className="text-xs text-zinc-500">
              {heardCount}/{BUILDER_TAPES.length} heard
            </p>
          </div>
          <Link to="/stories/tapes" className="text-xs font-medium text-[#C5FF41] hover:underline">
            All episodes →
          </Link>
        </div>
      )}

      <ul className={cn("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-2")}>
        {BUILDER_TAPES.map((tape) => {
          const claimed = completedSlugs.includes(`builder-tape-listen-${tape.slug}`);
          const local = readLocalTapeProgress(tape.slug);
          const ratio = tapeListenRatio(local);
          const inProgress = !claimed && ratio > 0.05;

          return (
            <li key={tape.slug}>
              <Link
                to="/stories/tapes/$slug"
                params={{ slug: tape.slug }}
                className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#C5FF41]/30 hover:bg-white/[0.05]"
              >
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/50">
                  {claimed ? (
                    <Headphones className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Play className="h-6 w-6 text-[#C5FF41] opacity-80 group-hover:opacity-100" />
                  )}
                  {inProgress ? (
                    <span
                      className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black bg-[#00E5FF]"
                      title="In progress"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    {tape.kicker}
                  </p>
                  <p className="mt-0.5 font-display font-semibold text-white">{tape.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{tape.oneLiner}</p>
                  {claimed ? (
                    <p className="mt-2 font-mono text-[10px] text-emerald-400/90">
                      +20 CP credited
                    </p>
                  ) : inProgress ? (
                    <p className="mt-2 font-mono text-[10px] text-[#00E5FF]">
                      {Math.round(ratio * 100)}% listened
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {!compact ? (
        <p className="text-center text-xs text-zinc-600">
          Fiction lives in{" "}
          <Link to="/chronicles" className="text-zinc-400 underline hover:text-white">
            Culture Chronicles
          </Link>
          . These tapes are the founder&apos;s voice — unfiltered.
        </p>
      ) : null}
    </div>
  );
}

export function BuilderTapesPromo({ className }: { className?: string }) {
  return (
    <Link
      to="/stories/tapes"
      className={cn(
        "block rounded-2xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#C5FF41]/10 to-transparent p-5 transition hover:border-[#C5FF41]/40",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C5FF41]/40 bg-black/40">
          <Headphones className="h-5 w-5 text-[#C5FF41]" />
        </div>
        <div>
          <p className="font-display font-semibold text-white">Builder Tapes</p>
          <p className="text-xs text-zinc-400">5 real stories · listen &amp; earn Culture Points</p>
        </div>
      </div>
    </Link>
  );
}
