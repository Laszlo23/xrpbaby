import { Link } from "@tanstack/react-router";
import { Calendar, BookOpen, Sparkles, Headphones } from "lucide-react";

import { CultureCoachBeat } from "@/components/quests/CultureCoachBeat";
import { FOUNDING_DAILY_QUESTS } from "@/lib/founding-quests";
import { CHRONICLE_EDITION_COUNT } from "@/content/culture-chronicles";
import { BUILDER_TAPES, countCompletedBuilderTapes } from "@/content/builder-tapes";

type UnifiedQuestHubProps = {
  completedSlugs?: string[];
  chronicleOwnedCount?: number;
  compact?: boolean;
};

export function UnifiedQuestHub({
  completedSlugs = [],
  chronicleOwnedCount = 0,
  compact = false,
}: UnifiedQuestHubProps) {
  const dailyDone = completedSlugs.filter((s) =>
    ["daily-check-in", "connect-wallet"].includes(s),
  ).length;
  const foundingDone = completedSlugs.filter((s) =>
    FOUNDING_DAILY_QUESTS.some((q) => q.slug === s),
  ).length;
  const tapesHeard = countCompletedBuilderTapes(completedSlugs);

  const tiers = [
    {
      id: "daily",
      icon: Calendar,
      label: "Daily pulse",
      desc: "Check-in, streaks, and quick wins.",
      href: "/forest",
      progress: `${dailyDone}/2 today`,
      coachSlug: "connect-wallet",
    },
    {
      id: "founding",
      icon: Sparkles,
      label: "Founding arcs",
      desc: "Story quests that stack Culture Points.",
      href: "/forest/quests",
      progress: `${foundingDone}/${FOUNDING_DAILY_QUESTS.length}`,
      coachSlug: "join-forest",
    },
    {
      id: "chronicle",
      icon: BookOpen,
      label: "Chronicle chapters",
      desc: "Long-form story NFTs on Base.",
      href: "/chronicles",
      progress: `${chronicleOwnedCount}/${CHRONICLE_EDITION_COUNT}`,
      coachSlug: undefined,
    },
    {
      id: "tapes",
      icon: Headphones,
      label: "Builder Tapes",
      desc: "5 real founder stories — listen & share.",
      href: "/stories/tapes",
      progress: `${tapesHeard}/${BUILDER_TAPES.length}`,
      coachSlug: "builder-tape-first-listen",
    },
  ];

  return (
    <section className="space-y-4">
      {!compact ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Today&apos;s quests
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Four tiers — daily pulse, founding stories, chronicle chapters, and Builder Tapes.
          </p>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Link
            key={tier.id}
            to={tier.href}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#C5FF41]/30 hover:bg-white/[0.05]"
          >
            <tier.icon className="h-5 w-5 text-[#C5FF41]" strokeWidth={1.75} />
            <p className="mt-3 font-display text-base font-semibold text-white">{tier.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{tier.desc}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[#00E5FF]">
              {tier.progress}
            </p>
          </Link>
        ))}
      </div>
      {tiers[0]?.coachSlug ? (
        <CultureCoachBeat questSlug={tiers[1]?.coachSlug ?? "join-forest"} />
      ) : null}
    </section>
  );
}
