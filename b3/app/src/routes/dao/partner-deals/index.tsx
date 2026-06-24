import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type DealSummary = {
  id: string;
  title: string;
  status: string;
  amountUsdc: string;
  deliverBy: string;
  onChainDealId: string | null;
};

export const Route = createFileRoute("/dao/partner-deals/")({
  component: DaoPartnerDealsIndexPage,
});

function DaoPartnerDealsIndexPage() {
  const { address } = useAccount();
  const [deals, setDeals] = useState<DealSummary[]>([]);

  useEffect(() => {
    const q = address ? `?payer=${address}` : "";
    void fetch(`/api/partner-deals/${q}`)
      .then((r) => r.json())
      .then((data: { ok: boolean; deals?: DealSummary[] }) => {
        if (data.ok && data.deals) setDeals(data.deals);
      });
  }, [address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[rgb(8_8_10)] to-black px-4 py-10 pb-nav-safe">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl text-white">Partner service escrow</h1>
            <p className="mt-1 text-sm text-zinc-400">DAO deals with USDC escrow on Base.</p>
          </div>
          <Link
            to="/dao/partner-deals/new"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-white/30"
          >
            New deal
          </Link>
        </div>

        <Link
          to="/how-we-partner"
          className="flex items-center justify-between gap-4 rounded-xl border border-[rgb(212_175_55/0.2)] bg-[rgb(212_175_55/0.06)] px-5 py-4 text-sm text-zinc-300 transition hover:border-[rgb(212_175_55/0.35)]"
        >
          <span>
            <strong className="font-medium text-white">How we pay partners</strong> — USDC escrow,
            AI ruling, council veto. Read the full story.
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--vault-gold)]" aria-hidden />
        </Link>

        <ul className="space-y-3">
          {deals.map((deal) => (
            <li key={deal.id}>
              <Link
                to="/dao/partner-deals/$id"
                params={{ id: deal.id }}
                className="block rounded-xl border border-white/10 bg-black/40 p-4 hover:border-white/20"
              >
                <p className="font-medium text-white">{deal.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {deal.status} · {(Number(deal.amountUsdc) / 1_000_000).toFixed(2)} USDC · #
                  {deal.onChainDealId ?? "draft"}
                </p>
              </Link>
            </li>
          ))}
          {deals.length === 0 ? <li className="text-sm text-zinc-500">No deals yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}
