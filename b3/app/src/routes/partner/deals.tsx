import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

type DealSummary = {
  id: string;
  title: string;
  status: string;
  amountUsdc: string;
  deliverBy: string;
  onChainDealId: string | null;
};

export const Route = createFileRoute("/partner/deals")({
  component: PartnerDealsPage,
});

function PartnerDealsPage() {
  const { address, isConnected } = useAccount();
  const [deals, setDeals] = useState<DealSummary[]>([]);

  useEffect(() => {
    if (!address) {
      setDeals([]);
      return;
    }
    void fetch(`/api/partner-deals/?provider=${address}`)
      .then((r) => r.json())
      .then((data: { ok: boolean; deals?: DealSummary[] }) => {
        if (data.ok && data.deals) setDeals(data.deals);
      });
  }, [address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[rgb(8_8_10)] to-black px-4 py-10 pb-nav-safe">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl text-white">Your partner deals</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Submit delivery evidence for assigned escrow deals.
          </p>
        </div>

        {!isConnected ? (
          <p className="text-sm text-zinc-500">Connect wallet to see assigned deals.</p>
        ) : (
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
                    {deal.status} · {(Number(deal.amountUsdc) / 1_000_000).toFixed(2)} USDC
                  </p>
                </Link>
              </li>
            ))}
            {deals.length === 0 ? (
              <li className="text-sm text-zinc-500">No deals assigned to this wallet.</li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
