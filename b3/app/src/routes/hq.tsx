import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Cpu, Megaphone, Trophy } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { CampaignPackCheckout } from "@/components/campaign/CampaignPackCheckout";
import { HqMilestoneBar } from "@/components/campaign/HqMilestoneBar";
import { HQ_AMENITIES, HQ_COPY } from "@/content/hq-fundraise";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";
import { formatPackUsd, HQ_FUNDRAISE_GOAL_USD } from "@/lib/packs";

export const Route = createFileRoute("/hq")({
  head: () =>
    pageHead({
      title: "Culture HQ 77777 — Live / Work / Stay",
      description:
        "Fundraise for Building Culture headquarters: 3 bed, 2 bath terrace condo with cowork, kitchen, and stay credits for backers.",
      path: "/hq",
      keywords: ["Building Culture", "HQ", "fundraise", "cowork", "live work"],
    }),
  component: HqFundraisePage,
});

function HqFundraisePage() {
  return (
    <MarketingShell
      eyebrow="Culture HQ · 77777"
      tone="amber"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Sleep, ship, and host —{" "}
          <span className="bg-gradient-to-r from-[var(--vault-gold)] via-white to-[#C5FF41] bg-clip-text text-transparent">
            Culture HQ
          </span>
        </>
      }
      subtitle={HQ_COPY.tagline}
      actions={
        <>
          <a href="#pledge">
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--vault-gold)] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_44px_-8px_rgb(212_175_55/0.5)] transition hover:brightness-110 active:scale-[0.98]">
              Pledge to HQ
            </span>
          </a>
          <Link to="/triple-333">
            <span className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-6 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28">
              Triple 333 raffle
            </span>
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-12 md:gap-14">
        <DisclaimerBanner />
        <HqMilestoneBar />

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white">Why a headquarters</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-300">
            {HQ_COPY.thesis.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="text-sm text-zinc-500">{HQ_COPY.disclaimer}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {HQ_AMENITIES.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[var(--vault-gold)]" aria-hidden />
                <h3 className="font-heading font-semibold text-white">{item.label}</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
            </article>
          ))}
        </section>

        <section id="pledge" className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white">
            Pledge tiers · goal {formatPackUsd(HQ_FUNDRAISE_GOAL_USD)}
          </h2>
          <p className="text-sm text-zinc-400">
            Card checkout via Stripe. Pledges credit Culture Points and HQ stay perks — not equity.
            Connect wallet first so your receipt lands on your profile.
          </p>
          <CampaignPackCheckout campaign="hq" />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
          <strong className="text-zinc-200">Ops transparency:</strong> aggregate progress sums
          verified <code className="text-zinc-300">PackPurchase</code> rows for HQ tiers. Treasury
          routing follows published policy on{" "}
          <Link to="/investors" className="text-[#C5FF41] underline underline-offset-2">
            /investors
          </Link>
          .
        </section>
      </div>
    </MarketingShell>
  );
}
