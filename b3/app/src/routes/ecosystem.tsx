import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { LandingNav } from "@/components/landing/LandingNav";
import { ModuleBentoGrid } from "@/components/landing/ModuleBentoGrid";
import { useShowLoggedInShell } from "@/hooks/useShowLoggedInShell";
import {
  ECOSYSTEM_CATEGORIES,
  ECOSYSTEM_SATELLITES,
  ECOSYSTEM_CORE_APPS,
  ECOSYSTEM_DIRECTORY_EXTRAS,
  LANDING_ECOSYSTEM,
  ecosystemAppsByCategory,
  type EcosystemCategoryId,
} from "@/lib/landing-ecosystem";
import { LANDING_NORTH_STAR } from "@/lib/landing-copy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/ecosystem")({
  head: () =>
    pageHead({
      title: "Ecosystem — Building Culture",
      description:
        "Places, art, AI apps, games, and capital rails — the full Building Culture ecosystem directory.",
      path: "/ecosystem",
      keywords: [
        "Building Culture",
        "ecosystem",
        "WohnAI",
        "Culture Atlas",
        "Places",
        "BCC",
        "Agent OS",
        "Campaign Hub",
      ],
    }),
  component: EcosystemPage,
});

function EcosystemPage() {
  const showLoggedInShell = useShowLoggedInShell();
  const allApps = [
    ...new Map(
      [
        ...ECOSYSTEM_SATELLITES,
        ...ECOSYSTEM_CORE_APPS,
        ...ECOSYSTEM_DIRECTORY_EXTRAS,
        ...LANDING_ECOSYSTEM,
      ].map((a) => [a.id, a]),
    ).values(),
  ];

  return (
    <div className="bc-surface min-h-screen antialiased">
      {!showLoggedInShell ? <LandingNav compact /> : null}
      <main>
        <section
          className={`relative overflow-hidden bg-black pb-16 ${showLoggedInShell ? "pt-8 sm:pt-10" : "pt-28 sm:pt-36"}`}
        >
          <div className="absolute inset-0 bc-grid opacity-30" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <p className="mono-label">ECOSYSTEM DIRECTORY</p>
            <h1 className="mt-6 font-display text-[40px] font-bold tracking-tight text-white sm:text-6xl">
              The Building Culture ecosystem
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-zinc-400">{LANDING_NORTH_STAR}</p>
            <p className="mt-4 max-w-3xl text-base text-zinc-500">
              BCC = economy · XRPL = credentials &amp; payments · Base = social layer · Agents =
              workforce · Places = real-world impact
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/pass"
                className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-5 py-2.5 text-sm font-semibold text-black hover:bg-white"
              >
                Claim Culture ID
                <ArrowUpRight size={14} />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:border-[#00E5FF]/60"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {ECOSYSTEM_CATEGORIES.map((category) => {
          const apps = ecosystemAppsByCategory(category.id as EcosystemCategoryId);
          if (apps.length === 0) return null;
          return (
            <section
              key={category.id}
              id={category.id}
              className="relative border-t border-white/5 py-16 sm:py-20"
            >
              <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="max-w-2xl">
                  <p className="mono-label">{category.label.toUpperCase()}</p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                    {category.label}
                  </h2>
                  <p className="mt-3 text-base text-zinc-400">{category.description}</p>
                </div>
                <div className="mt-10">
                  <ModuleBentoGrid apps={apps} section={`ecosystem-${category.id}`} />
                </div>
              </div>
            </section>
          );
        })}

        <section className="relative border-t border-white/5 bg-[#070707] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="mono-label">ALL APPS</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                Full directory
              </h2>
              <p className="mt-3 text-sm text-zinc-500">
                Every app in the Building Culture stack — for discovery and SEO.
              </p>
            </div>
            <div className="mt-10">
              <ModuleBentoGrid apps={allApps} section="ecosystem-all" bento />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
