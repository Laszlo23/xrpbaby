import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useChainId } from "wagmi";
import { useState } from "react";

import { LandingNav } from "@/components/landing/LandingNav";
import { ModuleBentoGrid } from "@/components/landing/ModuleBentoGrid";
import { IdentityMintBand } from "@/components/identity/IdentityMintBand";
import { MemberForestSummary } from "@/components/MemberForestSummary";
import { CultureScoreSummary } from "@/components/profile/CultureScoreSummary";
import { MemberGettingStartedChecklist } from "@/components/MemberGettingStartedChecklist";
import { PostJoinPackPrompt } from "@/components/PostJoinPackPrompt";
import { bcdStagingHint } from "@/lib/bcd-configured";
import { plainLabels } from "@/lib/plain-labels";
import { COMMUNITY_MODULES, type LandingEcosystemApp } from "@/lib/landing-ecosystem";
import { platformModules } from "@/lib/modules";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

type ForestSearch = {
  welcome?: string;
};

export const Route = createFileRoute("/forest/")({
  validateSearch: (search: Record<string, unknown>): ForestSearch => ({
    welcome: typeof search.welcome === "string" ? search.welcome : undefined,
  }),
  component: CommunityHubPage,
  head: () =>
    pageHead({
      title: "Community Hub",
      description: `Your ${BRAND_DISPLAY_NAME} community home for quests, pulse updates, points, and every lane you unlock.`,
      path: "/forest",
      keywords: ["Build Culture", "community hub", "quests", "culture pulse", "points"],
    }),
});

const MODULE_FLAGS: Partial<Record<string, keyof typeof platformModules>> = {
  founding: "founding",
  pass: "identity",
  earth: "eco",
  art: "art",
  places: "places",
  "community-hub": "signal",
};

function filterModules(modules: LandingEcosystemApp[]): LandingEcosystemApp[] {
  return modules.filter((m) => {
    const flag = MODULE_FLAGS[m.id];
    if (!flag) return true;
    return platformModules[flag];
  });
}

function CommunityHubPage() {
  const chainId = useChainId();
  const { welcome } = Route.useSearch();
  const bcdHint = bcdStagingHint(chainId);
  const modules = filterModules(COMMUNITY_MODULES);
  const justJoined = welcome === "1";
  const [packOpen, setPackOpen] = useState(justJoined);

  return (
    <div className="bc-surface min-h-screen pb-nav-safe">
      <LandingNav compact />
      <PostJoinPackPrompt open={packOpen} onOpenChange={setPackOpen} />
      <main className="pt-28 pb-16">
        <section className="relative overflow-hidden border-b border-white/5">
          <motion.div className="absolute inset-0 bc-grid opacity-40" />
          <div className="absolute inset-0 bc-spotlight opacity-60" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="mono-label">COMMUNITY HUB</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] font-bold tracking-tight text-white sm:text-6xl">
              Built by people. <span className="bc-text-cyan-gradient">Your place</span> in the
              culture.
            </h1>
            <p className="mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">
              Quests, Culture Points, live pulse, and every lane you unlocked — one home for
              participating in places that come back to life.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/play"
                className="inline-flex items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
              >
                Open Play
              </Link>
              <Link
                to="/join"
                className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#00E5FF]/50"
              >
                Create your pass
              </Link>
              <a
                href="/#vision"
                className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#00E5FF]/50"
              >
                Read the story
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          {bcdHint ? (
            <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {bcdHint}
            </p>
          ) : null}

          <MemberGettingStartedChecklist highlight={justJoined} />

          <div className="mt-8">
            <CultureScoreSummary compact />
          </div>

          <div className="mt-10">
            <MemberForestSummary />
          </div>

          <Link
            to="/roots"
            className="mt-8 block overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent p-6 transition-colors hover:border-emerald-500/50 sm:p-8"
          >
            <span className="mono-label !text-emerald-300/90">ROOT SEASON</span>
            <span className="mt-2 block font-display text-2xl font-bold text-white">
              Grow your roots
            </span>
            <span className="mt-2 block text-sm text-zinc-400">
              Treasury-funded BCC staking for builders — plant before unlock, share the grove. Not
              guaranteed returns.
            </span>
          </Link>

          {platformModules.identity ? <IdentityMintBand /> : null}

          {platformModules.signal ? (
            <Link
              to="/signal"
              className="mt-8 block overflow-hidden rounded-3xl border border-[#C5FF41]/40 bg-gradient-to-r from-[#C5FF41]/10 to-transparent p-6 transition-colors hover:border-[#C5FF41]/60 sm:p-8"
            >
              <span className="mono-label !text-[#C5FF41]">LIVE</span>
              <span className="mt-2 block font-display text-2xl font-bold text-white">
                {plainLabels.forest.pulseTitle}
              </span>
              <span className="mt-2 block text-sm text-zinc-400">
                {plainLabels.forest.pulseSubtitle}
              </span>
            </Link>
          ) : null}

          <div className="mt-16">
            <p className="mono-label">{plainLabels.forest.modulesEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {plainLabels.forest.modulesTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-400">{plainLabels.forest.modulesSubtitle}</p>
            <div className="mt-10">
              <ModuleBentoGrid apps={modules} section="community_hub" bento={false} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
