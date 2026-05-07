import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { HeroSection } from "@/components/HeroSection";
import { BcdEconomyBanner } from "@/components/BcdEconomyBanner";
import { CommunityPulse } from "@/components/CommunityPulse";
import { HomeRwaDropsSection } from "@/components/HomeRwaDropsSection";
import { HomeLivePulse } from "@/components/HomeLivePulse";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Win Real-World Assets Onchain",
      description:
        "Win real-world art and stays worth €10k+ — provably fair onchain. Tickets, drops, and vault access to real assets — not promises.",
      path: "/",
      keywords: [
        "Build Culture",
        "RWA",
        "real world assets",
        "Base",
        "NFT tickets",
        "onchain raffle",
        "tokenized experiences",
      ],
    }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen pb-nav-safe">
      <HeroSection />

      <HomeRwaDropsSection />

      <HomeLivePulse />

      <BcdEconomyBanner />

      <CommunityPulse />

      <section
        id="how-it-works"
        className="scroll-mt-24 px-4 pb-16 md:scroll-mt-28 md:px-8 md:pb-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 backdrop-blur-sm md:px-10 md:py-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
              The loop
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl">
              No manuals — just momentum
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {[
                {
                  step: "01",
                  title: "Enter",
                  desc: "Vault opens — grab tickets while pools are live.",
                },
                {
                  step: "02",
                  title: "Compete",
                  desc: "Entries stack on-chain; odds tighten as mint fills.",
                },
                {
                  step: "03",
                  title: "Win",
                  desc: "Fair draw — stays, art, and venues with receipts.",
                },
                {
                  step: "04",
                  title: "Flex",
                  desc: "Leaderboard, XP, casts — culture that travels.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="space-y-3 border-t border-white/[0.06] pt-8 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 first:lg:pl-0 first:lg:border-l-0"
                >
                  <span className="font-mono text-xs tracking-[0.2em] text-zinc-600">
                    {item.step}
                  </span>
                  <h3 className="font-heading text-lg font-medium text-zinc-100">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
