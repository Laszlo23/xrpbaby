import { createFileRoute, Link } from "@tanstack/react-router";
import { PartnerDealDetailPanel } from "@/components/partner-deals/PartnerDealDetailPanel";

export const Route = createFileRoute("/dao/partner-deals/$id")({
  component: DaoPartnerDealDetailPage,
});

function DaoPartnerDealDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[rgb(8_8_10)] to-black px-4 py-10 pb-nav-safe">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/dao/partner-deals" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Partner deals
        </Link>
        <PartnerDealDetailPanel dealId={id} />
      </div>
    </div>
  );
}
