import { createFileRoute, Link } from "@tanstack/react-router";
import { PartnerDealCreateForm } from "@/components/partner-deals/PartnerDealCreateForm";

export const Route = createFileRoute("/dao/partner-deals/new")({
  component: DaoPartnerDealNewPage,
});

function DaoPartnerDealNewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[rgb(8_8_10)] to-black px-4 py-10 pb-nav-safe">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link to="/dao/partner-deals" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Partner deals
          </Link>
          <h1 className="mt-2 font-heading text-2xl text-white">DAO partner escrow</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Lock USDC against a hashed service JSON. AI proposes payout; council can veto within
            72h.
          </p>
        </div>
        <PartnerDealCreateForm />
      </div>
    </div>
  );
}
