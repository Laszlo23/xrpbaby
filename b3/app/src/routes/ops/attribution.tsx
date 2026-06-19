import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { ModuleShell } from "@/components/ModuleShell";

type Dashboard = {
  ok: boolean;
  generatedAt?: string;
  windows?: {
    last7d: {
      funnel: Record<string, number>;
      conversion: Record<string, number>;
      topAgentRefs: Array<{
        agentRef: string;
        funnel: Record<string, number>;
        rates: Record<string, number>;
        joins: number;
      }>;
    };
    last30d: {
      funnel: Record<string, number>;
      conversion: Record<string, number>;
    };
  };
  error?: string;
};

export const Route = createFileRoute("/ops/attribution")({
  component: OpsAttributionPage,
});

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function OpsAttributionPage() {
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState("");
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (authSecret?: string) => {
    setError(null);
    const headers: Record<string, string> = {};
    if (authSecret) headers["x-ops-dashboard-secret"] = authSecret;
    const res = await fetch("/api/platform/attribution-dashboard", { headers });
    const json = (await res.json()) as Dashboard;
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

  const w7 = data?.windows?.last7d;
  const w30 = data?.windows?.last30d;

  return (
    <ModuleShell
      moduleId="signal"
      title="Agent attribution dashboard"
      subtitle="ECO-002 — landing → wallet → mint funnel by agent_ref (7d / 30d)"
    >
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6">
        <p className="text-sm text-zinc-400">
          Data from <code className="text-zinc-300">ActivityEvent</code> via{" "}
          <code className="text-zinc-300">/api/platform/analytics</code>. Related:{" "}
          <Link to="/ops/revenue" className="text-emerald-400 underline">
            revenue lanes
          </Link>
          ,{" "}
          <Link to="/ops/outreach" className="text-emerald-400 underline">
            outreach
          </Link>
          . Set <code className="text-zinc-300">OPS_DASHBOARD_SECRET</code> in production to
          restrict access.
        </p>

        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStoredSecret(secret.trim());
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-400">Ops secret (optional)</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
              placeholder="OPS_DASHBOARD_SECRET"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Apply
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
            onClick={() => void load(storedSecret || undefined)}
          >
            Refresh
          </button>
        </form>

        {error ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {data?.generatedAt ? (
          <p className="text-xs text-zinc-500">Generated {data.generatedAt}</p>
        ) : null}

        {w7 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-100">Last 7 days — funnel</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(w7.funnel).map(([event, count]) => (
                <div key={event} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="font-mono text-xs text-zinc-500">
                    {event.replace("analytics:", "")}
                  </p>
                  <p className="text-2xl font-semibold text-zinc-100">{count}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-300">
              <p>View → connect: {pct(w7.conversion.viewToConnect)}</p>
              <p>Connect → click: {pct(w7.conversion.connectToClick)}</p>
              <p>Click → confirm: {pct(w7.conversion.clickToConfirm)}</p>
              <p className="font-medium text-emerald-300">
                View → confirm: {pct(w7.conversion.viewToConfirm)}
              </p>
            </div>
          </section>
        ) : null}

        {w7?.topAgentRefs?.length ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-100">Top agent_ref (7d)</h2>
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-900/80 text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">agent_ref</th>
                    <th className="px-3 py-2">joins</th>
                    <th className="px-3 py-2">mint confirmed</th>
                    <th className="px-3 py-2">view → confirm</th>
                  </tr>
                </thead>
                <tbody>
                  {w7.topAgentRefs.map((row) => (
                    <tr key={row.agentRef} className="border-t border-zinc-800">
                      <td className="px-3 py-2 font-mono text-zinc-200">{row.agentRef}</td>
                      <td className="px-3 py-2">{row.joins}</td>
                      <td className="px-3 py-2">{row.funnel["analytics:mint_confirmed"] ?? 0}</td>
                      <td className="px-3 py-2">{pct(row.rates.viewToConfirm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {w30 ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-100">Last 30 days — summary</h2>
            <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
              {JSON.stringify({ funnel: w30.funnel, conversion: w30.conversion }, null, 2)}
            </pre>
          </section>
        ) : null}
      </div>
    </ModuleShell>
  );
}
