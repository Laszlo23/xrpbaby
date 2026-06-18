"use client";

import { useQuery } from "@tanstack/react-query";

import type { InvestorTreasuryBalances } from "@/server/investors/treasury-balances";

type ApiResponse = InvestorTreasuryBalances | { ok: false; error?: string };

function fmtCapturedAt(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export function InvestorTreasuryBalances() {
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["investor-treasury-balances"],
    queryFn: async () => {
      const res = await fetch("/api/investors/treasury-balances");
      if (!res.ok) throw new Error("Failed to load treasury balances");
      return (await res.json()) as ApiResponse;
    },
    refetchInterval: 60_000,
  });

  const wallets = data && "wallets" in data ? data.wallets : [];
  const revenueSplit = data && "revenueSplit" in data ? data.revenueSplit : [];
  const capturedAt = data && "capturedAt" in data ? data.capturedAt : undefined;

  return (
    <section id="treasury-balances" className="scroll-mt-24 space-y-6">
      <div className="space-y-2">
        <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
          Published treasury wallets
        </h2>
        <p className="text-sm text-zinc-500">
          Labeled addresses and live balances for due diligence. Refreshed UTC:{" "}
          {isLoading ? "…" : fmtCapturedAt(capturedAt)}. Not an offer of securities.
        </p>
        {error ? (
          <p className="text-sm text-amber-200/90">Could not load balances — try again shortly.</p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              <th className="px-4 py-3 font-medium">Wallet</th>
              <th className="px-4 py-3 font-medium">Chain</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Balances</th>
            </tr>
          </thead>
          <tbody className="text-zinc-400">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Loading live balances…
                </td>
              </tr>
            ) : wallets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No published wallets configured.
                </td>
              </tr>
            ) : (
              wallets.map((w) => (
                <tr key={w.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-200">{w.label}</p>
                    <p className="mt-1 text-xs text-zinc-600">{w.role}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {w.chain}
                    <span className="mt-1 block text-zinc-600">{w.network}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={w.explorerUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-mono text-xs text-zinc-300 hover:text-white"
                    >
                      {w.address.slice(0, 8)}…{w.address.slice(-6)}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                    {w.balances.native ? <div>{w.balances.native}</div> : null}
                    {w.balances.usdc ? <div>{w.balances.usdc}</div> : null}
                    {w.balances.bcc ? <div>{w.balances.bcc}</div> : null}
                    {w.error ? <div className="text-amber-200/80">{w.error}</div> : null}
                    {!w.balances.native && !w.balances.usdc && !w.balances.bcc && !w.error ? (
                      <span className="text-zinc-600">—</span>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {revenueSplit.length > 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h3 className="font-heading text-base font-medium text-zinc-100">
            Protocol revenue split (on-chain policy)
          </h3>
          <p className="mt-2 text-xs text-zinc-600">
            Manual routing until BccFeeRouter deploy — see treasury policy docs.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {revenueSplit.map((bucket) => (
              <li
                key={bucket.id}
                className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm"
              >
                <span className="font-mono text-[#C5FF41]">{bucket.percent}%</span>{" "}
                <span className="text-zinc-300">{bucket.label}</span>
                <p className="mt-1 text-xs text-zinc-600">{bucket.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
