import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAccount, useChainId } from "wagmi";
import { useState } from "react";

import { ForestMemberDashboard } from "@/components/forest-dashboard/ForestMemberDashboard";
import { LandingNav } from "@/components/landing/LandingNav";
import { IdentityMintBand } from "@/components/identity/IdentityMintBand";
import { PostJoinPackPrompt } from "@/components/PostJoinPackPrompt";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
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
      title: "Your dashboard",
      description: `Your ${BRAND_DISPLAY_NAME} dashboard — daily check-in, tasks, Culture Points, and community leaderboard.`,
      path: "/forest",
      keywords: ["Build Culture", "dashboard", "quests", "culture points", "leaderboard"],
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

function ForestGuestHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <motion.div className="absolute inset-0 bc-grid opacity-40" />
      <div className="absolute inset-0 bc-spotlight opacity-60" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <p className="mono-label">COMMUNITY HUB</p>
        <h1 className="mt-4 max-w-3xl font-display text-3xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl">
          Built by people. <span className="bc-text-cyan-gradient">Your place</span> in the culture.
        </h1>
        <p className="mt-4 max-w-xl text-base text-zinc-400">
          Connect your wallet for a POV-style dashboard — daily check-in, tasks, referral link, and
          leaderboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/join"
            className="inline-flex items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
          >
            Create your pass
          </Link>
          <Link
            to="/play"
            className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#00E5FF]/50"
          >
            Open Play
          </Link>
          <Link
            to="/chronicles"
            className="inline-flex items-center rounded-full border border-[var(--vault-gold)]/40 px-6 py-3 text-sm font-semibold text-[var(--vault-gold)] hover:border-[var(--vault-gold)]"
          >
            Culture Chronicles
          </Link>
          <Link
            to="/hq"
            className="inline-flex items-center rounded-full border border-amber-400/40 px-6 py-3 text-sm font-semibold text-amber-200 hover:border-amber-300"
          >
            HQ 77777
          </Link>
          <Link
            to="/triple-333"
            className="inline-flex items-center rounded-full border border-violet-400/40 px-6 py-3 text-sm font-semibold text-violet-200 hover:border-violet-300"
          >
            Triple 333
          </Link>
          <Link
            to="/forest/grove"
            className="inline-flex items-center rounded-full border border-violet-400/40 px-6 py-3 text-sm font-semibold text-violet-200 hover:border-violet-300"
          >
            Culture DNA grove
          </Link>
        </div>
      </div>
    </section>
  );
}

function CommunityHubPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { welcome } = Route.useSearch();
  const bcdHint = bcdStagingHint(chainId);
  const modules = filterModules(COMMUNITY_MODULES);
  const justJoined = welcome === "1";
  const [packOpen, setPackOpen] = useState(justJoined);
  const showDashboard = isConnected && Boolean(address);

  return (
    <div className="bc-surface min-h-screen pb-nav-safe">
      {!showDashboard ? <LandingNav compact /> : null}
      <PostJoinPackPrompt open={packOpen} onOpenChange={setPackOpen} />
      <main className={showDashboard ? "pb-16" : "pt-28 pb-16"}>
        {showDashboard ? (
          <section className="mx-auto max-w-7xl px-5 sm:px-8">
            {bcdHint ? (
              <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {bcdHint}
              </p>
            ) : null}
            <SectionErrorBoundary label="Forest dashboard">
              <ForestMemberDashboard
                address={address!}
                justJoined={justJoined}
                modules={modules}
                modulesEyebrow={plainLabels.forest.modulesEyebrow}
                modulesTitle={plainLabels.forest.modulesTitle}
                modulesSubtitle={plainLabels.forest.modulesSubtitle}
              />
            </SectionErrorBoundary>
          </section>
        ) : (
          <SectionErrorBoundary label="Forest hub">
            <>
              <ForestGuestHero />
              <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
                {bcdHint ? (
                  <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    {bcdHint}
                  </p>
                ) : null}
                {platformModules.identity ? <IdentityMintBand /> : null}
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
              </section>
            </>
          </SectionErrorBoundary>
        )}
      </main>
    </div>
  );
}
