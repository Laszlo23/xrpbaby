import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { HowWePartnerSection } from "@/components/partner-deals/HowWePartnerSection";
import { PARTNER_ESCROW_SUBHEAD } from "@/content/partner-escrow-story";

export const Route = createFileRoute("/how-we-partner")({
  head: () =>
    pageHead({
      title: "How we partner — USDC escrow · AI + council",
      description:
        "Building Culture pays partners through on-chain USDC escrow: hashed service terms, AI fulfillment scoring, human council veto, automatic settlement on Base.",
      path: "/how-we-partner",
      keywords: [
        "partner escrow",
        "USDC",
        "Base",
        "DAO payments",
        "marketing partners",
        "Telegram",
        "service fulfillment",
      ],
    }),
  component: HowWePartnerPage,
});

function HowWePartnerPage() {
  return (
    <MarketingShell
      eyebrow="Transparent partner rails"
      tone="amber"
      heroSize="compact"
      articleClassName="max-w-5xl"
      title={
        <>
          Business without{" "}
          <span className="bg-gradient-to-r from-[var(--vault-gold)] via-white to-[rgb(0_82_255/90%)] bg-clip-text text-transparent">
            handshake trust
          </span>
        </>
      }
      subtitle={PARTNER_ESCROW_SUBHEAD}
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dao/partner-deals/new"
            className="inline-flex items-center justify-center rounded-full bg-[var(--base-blue)] px-6 py-2.5 text-sm font-medium text-white ring-1 ring-white/10 transition hover:opacity-90"
          >
            Create a deal
          </Link>
          <Link
            to="/partner/deals"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-200 transition hover:text-white"
          >
            I'm a provider
          </Link>
          <Link
            to="/investors"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-2.5 text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            Investor overview
          </Link>
        </div>
      }
    >
      <HowWePartnerSection variant="full" />
    </MarketingShell>
  );
}
