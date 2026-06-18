"use client";

import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { XrplIntakeStatus } from "@/server/xrp/treasury-intake";

export function XrplTestnetIntakePanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["investor-xrpl-intake"],
    queryFn: async () => {
      const res = await fetch("/api/investors/xrpl-intake?limit=5");
      if (!res.ok) throw new Error("xrpl_intake_failed");
      return (await res.json()) as XrplIntakeStatus;
    },
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-sm text-zinc-500">
        Loading XRPL testnet rail…
      </section>
    );
  }

  if (!data?.intakeAddress) {
    return (
      <section className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-zinc-500">
        XRPL testnet intake is not configured. Set{" "}
        <code className="text-zinc-400">XRPL_TREASURY_INTAKE_ADDRESS</code> and{" "}
        <code className="text-zinc-400">XRPL_NETWORK=testnet</code> for diligence demos.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/90">
          XRPL testnet — demo rail
        </p>
        <h3 className="mt-2 font-heading text-lg font-semibold text-white">Treasury intake (testnet)</h3>
        <p className="mt-2 text-sm text-zinc-400">{data.disclaimer}</p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-zinc-600">Network</dt>
          <dd className="font-mono text-zinc-200">{data.network}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">Balance</dt>
          <dd className="font-mono text-zinc-200">{data.balanceXrp ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-zinc-600">Intake address</dt>
          <dd className="mt-1 break-all font-mono text-xs text-emerald-200/90">{data.intakeAddress}</dd>
        </div>
      </dl>

      {data.recentPayments.length > 0 ? (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Recent testnet payments
          </h4>
          <ul className="mt-2 space-y-2 text-xs text-zinc-400">
            {data.recentPayments.map((p) => (
              <li key={p.hash} className="flex flex-wrap gap-2">
                <span className="font-mono text-zinc-300">{p.amountXrp}</span>
                <span>from {p.from.slice(0, 8)}…</span>
                {p.explorerUrl ? (
                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-emerald-300 hover:underline"
                  >
                    explorer ↗
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-zinc-600">No recent inbound testnet payments observed.</p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to="/credentials"
          hash="xrpl-link"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          Link XRPL to Culture ID
        </Link>
        <a
          href={`https://testnet.xrpl.org/accounts/${data.intakeAddress}`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-emerald-500/30 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/10"
        >
          Testnet explorer ↗
        </a>
      </div>
    </section>
  );
}
