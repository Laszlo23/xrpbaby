import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { ForestDailyCard } from "@/components/forest-dashboard/ForestDailyCard";
import { ForestLeaderboardPanel } from "@/components/forest-dashboard/ForestLeaderboardPanel";
import { ForestReferralCard } from "@/components/forest-dashboard/ForestReferralCard";
import { CultureGrovePanel } from "@/components/culture-grove/CultureGrovePanel";
import { ForestStatsHeader } from "@/components/forest-dashboard/ForestStatsHeader";
import { ForestTasksGrid } from "@/components/forest-dashboard/ForestTasksGrid";
import { MemberGettingStartedChecklist } from "@/components/MemberGettingStartedChecklist";
import { ModuleBentoGrid } from "@/components/landing/ModuleBentoGrid";
import { LayerQuickActions } from "@/components/layout/LayerQuickActions";
import { CultureLayerStackCompact } from "@/components/layout/CultureLayerStackCompact";
import { UnifiedQuestHub } from "@/components/quests/UnifiedQuestHub";
import { CULTURE_LAYERS } from "@/lib/culture-layers";
import { useForestMemberTasks } from "@/hooks/useForestMemberTasks";
import { useChronicleProgress } from "@/hooks/useChronicleProgress";
import type { LandingEcosystemApp } from "@/lib/landing-ecosystem";

type Props = {
  address: string;
  justJoined: boolean;
  modules: LandingEcosystemApp[];
  modulesEyebrow: string;
  modulesTitle: string;
  modulesSubtitle: string;
};

export function ForestMemberDashboard({
  address,
  justJoined,
  modules,
  modulesEyebrow,
  modulesTitle,
  modulesSubtitle,
}: Props) {
  const { summary, claimingSlug, signing, loadState, refresh, claimInline, completedSlugs } =
    useForestMemberTasks();
  const chronicleProgress = useChronicleProgress();
  const [modulesOpen, setModulesOpen] = useState(false);

  if (loadState === "db_down") {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
        <p className="font-medium">Database not reachable</p>
        <p className="mt-2 text-amber-200/80">Culture Points dashboard needs the app database.</p>
      </div>
    );
  }

  if (loadState === "loading" || !summary) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-8 text-center text-sm text-zinc-500">
        Loading your dashboard…
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
        Could not load dashboard.{" "}
        <button type="button" className="underline" onClick={() => void refresh()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ForestStatsHeader summary={summary} address={address} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-xl font-semibold text-white">Your culture hub</p>
        <Link
          to="/connect"
          className="rounded-full border border-[#00E5FF]/30 px-4 py-2 text-xs font-medium text-[#00E5FF] hover:bg-[#00E5FF]/10"
        >
          Explore profiles →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {CULTURE_LAYERS.map((layer) => (
          <LayerQuickActions key={layer.id} layerId={layer.id} maxItems={2} />
        ))}
      </div>

      <CultureLayerStackCompact />

      <UnifiedQuestHub
        completedSlugs={completedSlugs}
        chronicleOwnedCount={chronicleProgress.ownedCount}
      />

      <Link
        to="/chronicles"
        className="block rounded-2xl border border-[var(--vault-gold)]/25 bg-gradient-to-r from-[var(--vault-gold)]/10 to-transparent px-5 py-4 transition hover:border-[var(--vault-gold)]/40"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--vault-gold)]">
          Culture Chronicles
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-white">
          {chronicleProgress.isFounder
            ? "Chronicle Founder — full set owned"
            : `${chronicleProgress.ownedCount}/11 chapters collected`}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Mint scarce story NFTs on Base · earn Culture Points per chapter.
        </p>
      </Link>

      <div className="grid gap-4 md:grid-cols-2">
        <ForestDailyCard onBalanceRefresh={() => void refresh()} />
        <ForestReferralCard address={address} />
      </div>

      <CultureGrovePanel address={address} compact />

      {justJoined ? <MemberGettingStartedChecklist highlight /> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ForestTasksGrid
          completedSlugs={completedSlugs}
          claimingSlug={claimingSlug}
          claimDisabled={signing || claimingSlug !== null}
          onClaimInline={(slug) => void claimInline(slug)}
        />
        <ForestLeaderboardPanel />
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950/40">
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          onClick={() => setModulesOpen((o) => !o)}
        >
          <div>
            <p className="mono-label !text-zinc-500">{modulesEyebrow}</p>
            <p className="font-display text-lg font-semibold text-white">{modulesTitle}</p>
          </div>
          {modulesOpen ? (
            <ChevronUp className="h-5 w-5 text-zinc-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-500" />
          )}
        </button>
        {modulesOpen ? (
          <div className="border-t border-white/5 px-5 pb-8 pt-4">
            <p className="mb-6 max-w-2xl text-sm text-zinc-400">{modulesSubtitle}</p>
            <ModuleBentoGrid apps={modules} section="community_hub" bento={false} />
          </div>
        ) : null}
      </div>

      <p className="text-center text-xs text-zinc-600">
        <Link to="/roots" className="text-zinc-400 underline hover:text-[#C5FF41]">
          Culture Roots staking
        </Link>
        {" · "}
        <Link to="/signal" className="text-zinc-400 underline hover:text-[#C5FF41]">
          Live pulse
        </Link>
      </p>
    </div>
  );
}
