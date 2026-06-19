import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { InvestorWorkshopGate } from "@/components/investors/InvestorWorkshopGate";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/investors/workshop")({
  head: () =>
    pageHead({
      title: "Investor workshop (private)",
      description:
        "Password-gated scenario sandbox for advisor conversations — not a public offering.",
      path: "/investors/workshop",
      noIndex: true,
    }),
  component: InvestorWorkshopPage,
});

function InvestorWorkshopPage() {
  return (
    <MarketingShell
      eyebrow="Building Culture Capital · private"
      tone="purple"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title="Advisor scenario sandbox"
      subtitle="For live diligence calls only. Sliders model hypotheticals — they do not state round terms, valuation, or traction. Public proof stays on /investors and /grant-proof."
      actions={
        <Link
          to="/investors"
          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          ← Public investors page
        </Link>
      }
    >
      <InvestorWorkshopGate />
    </MarketingShell>
  );
}
