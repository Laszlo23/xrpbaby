"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { MERCH_DROPS } from "@/content/marketplace-merch";

type MerchDashboard = {
  ok: boolean;
  drops: Array<{
    slug: string;
    title: string;
    editionCap: number;
    soldCount: number;
    status: string;
    fundedAt: string | null;
    imageUrl: string;
  }>;
  orders: Array<{
    id: string;
    dropSlug: string;
    dropTitle: string;
    unitNumber: number;
    size: string;
    wallet: string;
    status: string;
    priceUsd: number;
    paymentRail: string;
    claimCode: string;
    claimedAt: string | null;
    createdAt: string;
  }>;
  totals: {
    paidOrders: number;
    grossUsd: number;
    productionPoolUsd: number;
    fundedDrops: number;
  };
  error?: string;
};

export const Route = createFileRoute("/marketplace/merch/ops")({
  head: () =>
    pageHead({
      title: "Merch ops — Building Culture",
      description: "Internal merch batch dashboard — funded drops, orders, production CSV.",
      path: "/marketplace/merch/ops",
    }),
  component: MerchOpsPage,
});

function MerchOpsPage() {
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState("");
  const [dashboard, setDashboard] = useState<MerchDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (authSecret?: string) => {
    setError(null);
    const headers: Record<string, string> = {};
    if (authSecret) headers["x-ops-dashboard-secret"] = authSecret;
    const res = await fetch("/api/marketplace/merch/dashboard", { headers });
    const json = (await res.json()) as MerchDashboard;
    if (!res.ok) {
      setError(json.error ?? `HTTP ${res.status}`);
      setDashboard(null);
      return;
    }
    setDashboard(json);
  }, []);

  useEffect(() => {
    void load(storedSecret || undefined);
  }, [load, storedSecret]);

  const totals = dashboard?.totals;

  return (
    <MarketingShell
      eyebrow="Internal · Culture merch"
      tone="slate"
      heroSize="compact"
      articleClassName="max-w-5xl"
      title={
        <>
          Merch batches & <span className="text-zinc-100">fulfillment</span>
        </>
      }
      subtitle="Requires OPS_DASHBOARD_SECRET in production. Ladder-priced tees — batch funds when paid count hits edition cap."
      actions={
        <>
          <Button variant="secondary" className="rounded-full" asChild>
            <Link to="/marketplace/merch">Public merch hub</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/agent-fleet">Agent fleet</Link>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStoredSecret(secret.trim());
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-400">Ops secret</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
              placeholder="OPS_DASHBOARD_SECRET"
            />
          </label>
          <Button type="submit" variant="secondary" className="rounded-full">
            Load dashboard
          </Button>
        </form>

        {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}

        {totals ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Paid orders" value={String(totals.paidOrders)} />
            <StatCard label="Gross USD" value={`$${totals.grossUsd.toFixed(2)}`} />
            <StatCard label="Production pool" value={`$${totals.productionPoolUsd.toFixed(2)}`} />
            <StatCard label="Funded drops" value={String(totals.fundedDrops)} />
          </div>
        ) : !error ? (
          <p className="text-sm text-zinc-500">Enter ops secret to load dashboard.</p>
        ) : null}

        <section>
          <h2 className="font-heading text-lg font-semibold text-white">Catalog</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {MERCH_DROPS.map((d) => {
              const live = dashboard?.drops.find((x) => x.slug === d.slug);
              return (
                <li key={d.slug}>
                  <Link
                    to="/marketplace/merch/$slug"
                    params={{ slug: d.slug }}
                    className="text-zinc-300 hover:text-white"
                  >
                    {d.title}
                  </Link>{" "}
                  — {live ? `${live.soldCount} paid / ${live.editionCap} · ${live.status}` : "—"}
                </li>
              );
            })}
          </ul>
        </section>

        {dashboard?.orders && dashboard.orders.length > 0 ? (
          <section>
            <h2 className="font-heading text-lg font-semibold text-white">Recent orders</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="py-2 pr-4">Unit</th>
                    <th className="py-2 pr-4">Design</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">USD</th>
                    <th className="py-2">Claim</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/[0.06] text-zinc-300">
                      <td className="py-3 pr-4 font-mono">#{o.unitNumber}</td>
                      <td className="py-3 pr-4">{o.dropTitle}</td>
                      <td className="py-3 pr-4">{o.size}</td>
                      <td className="py-3 pr-4">{o.status}</td>
                      <td className="py-3 pr-4">{o.priceUsd.toFixed(2)}</td>
                      <td className="py-3 font-mono text-xs">{o.claimCode.slice(0, 12)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : dashboard ? (
          <p className="text-sm text-zinc-500">No merch orders yet.</p>
        ) : null}

        <p className="text-xs text-zinc-600">
          Label QR spec: 2×2 cm minimum, error correction H. Optional MERCH_POD_WEBHOOK_URL for
          Phase 2 Printful.
        </p>
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
