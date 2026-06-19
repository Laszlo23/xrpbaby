import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { ModuleShell } from "@/components/ModuleShell";

type RevenueDashboard = {
  ok: boolean;
  generatedAt?: string;
  lanes?: {
    stripe: { configured: boolean; packPurchases: number };
    x402: { configured: boolean; researchPrice: string };
    outreach: { resendConfigured: boolean; targets: number; drafts: number; sent: number };
    agents: { successfulRuns: number };
  };
  grantProof?: string;
  error?: string;
};

export const Route = createFileRoute("/ops/revenue")({
  component: OpsRevenuePage,
});

function OpsRevenuePage() {
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState("");
  const [data, setData] = useState<RevenueDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (authSecret?: string) => {
    setError(null);
    const headers: Record<string, string> = {};
    if (authSecret) headers["x-ops-dashboard-secret"] = authSecret;
    const res = await fetch("/api/ops/revenue", { headers });
    const json = (await res.json()) as RevenueDashboard;
    if (!res.ok) {
      setError(json.error ?? `HTTP ${res.status}`);
      setData(null);
      return;
    }
    setData(json);
  }, []);

  useEffect(() => {
    void load(storedSecret || undefined);
  }, [load, storedSecret]);

  const lanes = data?.lanes;

  return (
    <ModuleShell
      moduleId="signal"
      title="Revenue lanes"
      subtitle="72h cash sprint — Stripe packs, x402 Research, outreach, agent runs"
    >
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6">
        <p className="text-sm text-zinc-400">
          Read-only counters from <code className="text-zinc-300">/api/ops/revenue</code>. See repo{" "}
          <code className="text-zinc-300">docs/STRIPE_PACKS_ACTIVATION.md</code> and{" "}
          <code className="text-zinc-300">deploy/.env</code> for activation. Also{" "}
          <Link to="/ops/attribution" className="text-emerald-400 underline">
            attribution
          </Link>{" "}
          and{" "}
          <Link to="/ops/outreach" className="text-emerald-400 underline">
            outreach
          </Link>
          .
        </p>

        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStoredSecret(secret.trim());
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-400">OPS dashboard secret</span>
            <input
              type="password"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="x-ops-dashboard-secret"
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Load
          </button>
        </form>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {lanes ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <LaneCard
              title="Stripe culture packs"
              ok={lanes.stripe.configured}
              detail={`${lanes.stripe.packPurchases} purchases recorded`}
            />
            <LaneCard
              title="x402 Research Agent"
              ok={lanes.x402.configured}
              detail={`Price: ${lanes.x402.researchPrice}`}
            />
            <LaneCard
              title="Outreach (Resend)"
              ok={lanes.outreach.resendConfigured}
              detail={`${lanes.outreach.sent} sent · ${lanes.outreach.drafts} drafts · ${lanes.outreach.targets} targets`}
            />
            <LaneCard
              title="Paid agent runs"
              ok={lanes.agents.successfulRuns > 0}
              detail={`${lanes.agents.successfulRuns} successful research/grant runs`}
            />
          </div>
        ) : null}

        {data?.grantProof ? (
          <p className="text-sm text-zinc-400">
            Grant proof:{" "}
            <a className="text-emerald-400 underline" href={data.grantProof}>
              {data.grantProof}
            </a>
          </p>
        ) : null}
      </div>
    </ModuleShell>
  );
}

function LaneCard({ title, ok, detail }: { title: string; ok: boolean; detail: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-zinc-100">{title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${ok ? "bg-emerald-900/50 text-emerald-300" : "bg-amber-900/50 text-amber-300"}`}
        >
          {ok ? "live" : "needs config"}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
    </div>
  );
}
