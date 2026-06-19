import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { MARKETPLACE_SERVICES } from "@/content/marketplace-services";
import {
  fetchServiceOrdersDashboardFn,
  type ServiceOrdersDashboard,
} from "@/lib/marketplace/service-orders-fn";

export const Route = createFileRoute("/agent-fleet/services")({
  head: () =>
    pageHead({
      title: "Service orders — Agent fleet",
      description:
        "Internal marketplace service orders dashboard — USDC collected, margin, reinvest pool.",
      path: "/agent-fleet/services",
    }),
  loader: async (): Promise<{ dashboard: ServiceOrdersDashboard | null }> => {
    try {
      return { dashboard: await fetchServiceOrdersDashboardFn() };
    } catch (e) {
      console.warn("/agent-fleet/services loader:", e);
      return { dashboard: null };
    }
  },
  component: AgentFleetServicesPage,
});

function AgentFleetServicesPage() {
  const { dashboard } = Route.useLoaderData();
  const totals = dashboard?.totals;

  return (
    <MarketingShell
      eyebrow="Internal · Marketplace services"
      tone="slate"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Service orders & <span className="text-zinc-100">margin</span>
        </>
      }
      subtitle="x402 USDC kickoffs, in-flight fulfillment, and estimated margin after COGS + 25% reinvest."
      actions={
        <>
          <Button variant="secondary" className="rounded-full" asChild>
            <Link to="/marketplace/services">Public services hub</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/agent-fleet">Agent fleet</Link>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        {totals ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Paid orders" value={String(totals.count)} />
            <StatCard label="USDC collected" value={`$${totals.usdcCollected.toFixed(2)}`} />
            <StatCard label="In flight" value={String(totals.inFlight)} />
            <StatCard label="Est. margin" value={`$${totals.estMarginUsd.toFixed(2)}`} />
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Dashboard unavailable — database not connected.</p>
        )}

        {totals ? (
          <p className="text-xs text-zinc-600">
            Reinvest pool (25%): ${totals.reinvestPoolUsd.toFixed(2)} · Set{" "}
            <span className="font-mono text-zinc-500">SERVICE_REVENUE_WALLET</span> for settlement.
          </p>
        ) : null}

        <section>
          <h2 className="font-heading text-lg font-semibold text-white">Catalog SKUs</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {MARKETPLACE_SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/marketplace/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-zinc-300 hover:text-white"
                >
                  {s.title}
                </Link>{" "}
                — {s.kickoffPrice}
              </li>
            ))}
          </ul>
        </section>

        {dashboard?.orders && dashboard.orders.length > 0 ? (
          <section>
            <h2 className="font-heading text-lg font-semibold text-white">Recent orders</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">USDC</th>
                    <th className="py-2">Milestones</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.orders.map((o: ServiceOrdersDashboard["orders"][number]) => (
                    <tr key={o.id} className="border-b border-white/[0.06] text-zinc-300">
                      <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 10)}…</td>
                      <td className="py-3 pr-4">{o.slug}</td>
                      <td className="py-3 pr-4">{o.status}</td>
                      <td className="py-3 pr-4">{o.amountUsdc}</td>
                      <td className="py-3">
                        {o.milestones
                          .map(
                            (m: ServiceOrdersDashboard["orders"][number]["milestones"][number]) =>
                              `${m.index}:${m.status}`,
                          )
                          .join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <p className="text-sm text-zinc-500">No service orders yet.</p>
        )}
      </div>
    </MarketingShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-xl text-white">{value}</p>
    </div>
  );
}
