import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Ticket } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { CampaignPackCheckout } from "@/components/campaign/CampaignPackCheckout";
import { Triple333SplitBar } from "@/components/campaign/Triple333SplitBar";
import { DropCard } from "@/components/DropCard";
import { TRIPLE_333_COPY } from "@/content/triple-333-campaign";
import { getDropBySlug } from "@/content/home-drops";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";
import { formatPackUsd } from "@/lib/packs";

export const Route = createFileRoute("/triple-333")({
  head: () =>
    pageHead({
      title: "Triple 333 — AI · Winner · Marketing",
      description:
        "333 tickets × $3 = $999 per round. Transparent split: $333 AI & servers, $333 winner, $333 marketing.",
      path: "/triple-333",
      keywords: ["Building Culture", "raffle", "Triple 333", "fundraise"],
    }),
  component: Triple333Page,
});

function Triple333Page() {
  const drop = getDropBySlug("triple-333");

  return (
    <MarketingShell
      eyebrow="Ops raffle · Triple 333"
      tone="purple"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          {TRIPLE_333_COPY.title} —{" "}
          <span className="bg-gradient-to-r from-[#C5FF41] via-white to-[var(--b3-purple)] bg-clip-text text-transparent">
            {formatPackUsd(TRIPLE_333_COPY.roundTotalUsd)} rounds
          </span>
        </>
      }
      subtitle={TRIPLE_333_COPY.tagline}
      actions={
        <>
          <a href="#enter">
            <span className="inline-flex items-center justify-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]">
              Enter round
            </span>
          </a>
          <Link to="/hq">
            <span className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-6 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28">
              Culture HQ 77777
            </span>
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-12 md:gap-14">
        <DisclaimerBanner />
        <Triple333SplitBar />

        <section className="grid gap-4 md:grid-cols-3">
          {TRIPLE_333_COPY.rules.slice(0, 3).map((rule, i) => {
            const icons = [Ticket, Building2, Ticket];
            const Icon = icons[i] ?? Ticket;
            return (
              <article
                key={rule}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <Icon className="h-5 w-5 text-[#C5FF41]" aria-hidden />
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{rule}</p>
              </article>
            );
          })}
        </section>

        <section id="enter" className="space-y-6">
          <h2 className="font-heading text-xl font-semibold text-white">
            Enter with card · ${TRIPLE_333_COPY.ticketPriceUsd} per ticket
          </h2>
          <CampaignPackCheckout campaign="triple_333" />
        </section>

        {drop ? (
          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-white">Or mint on Base (ETH)</h2>
            <div className="max-w-md">
              <DropCard
                title={drop.title}
                artist={drop.artist}
                assetValueLabel={drop.assetValueLabel}
                worthLabel={drop.worthLabel}
                winnerMode={drop.winnerMode}
                winnerCopy={drop.winnerCopy}
                slug={drop.slug}
                image={drop.image}
                posterImage={drop.posterImage}
                ticketsSold={drop.ticketsSold}
                totalTickets={drop.totalTickets}
                endsAt={drop.endsAt}
                rarity={drop.rarity}
                campaignAddress={drop.campaignAddress}
                ticketPriceLabel={drop.ticketPriceLabel}
              />
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-zinc-500">
          <p>
            Proceeds route to treasury per published split policy. Winner selection uses verifiable
            draw mechanics when the on-chain round closes. See{" "}
            <Link to="/collections" className="text-[#C5FF41] underline underline-offset-2">
              your tickets
            </Link>{" "}
            after mint.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
