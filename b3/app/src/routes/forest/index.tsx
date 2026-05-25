import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useChainId } from "wagmi";

import { LandingNav } from "@/components/landing/LandingNav";
import { ModuleBentoGrid } from "@/components/landing/ModuleBentoGrid";
import { IdentityMintBand } from "@/components/identity/IdentityMintBand";
import { MemberForestSummary } from "@/components/MemberForestSummary";
import { bcdStagingHint } from "@/lib/bcd-configured";
import { plainLabels } from "@/lib/plain-labels";
import { COMMUNITY_MODULES, type LandingEcosystemApp } from "@/lib/landing-ecosystem";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/forest/")({
  component: CommunityHubPage,
  head: () => ({
    meta: [{ title: "Community hub — Building Culture" }],
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
  const bcdHint = bcdStagingHint(chainId);
  const modules = filterModules(COMMUNITY_MODULES);

  return (
    <div className="bc-surface min-h-screen">
      <LandingNav compact />
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
                to="/join"
                className="inline-flex items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
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

          <MemberForestSummary />

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
