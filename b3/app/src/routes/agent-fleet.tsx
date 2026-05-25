import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import {
  AGENT_FLEET,
  ERC8004_ECOSYSTEM_LINKS,
  CEO_AGENT_ID,
  TASK_ROUTE_HINTS,
  planOrchestration,
} from "@/lib/bcd-agent-fleet";
import { postAgentFleetDashboard } from "@/lib/agent-fleet-dashboard-fn";
import type { AgentFleetDashboard } from "@/server/agents/dashboard";
import { ExternalLink, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/agent-fleet")({
  head: () =>
    pageHead({
      title: "Agent fleet — ERC-8004",
      description:
        "BUILDCHAIN agent fleet — coordinated AI agents for growth, social, treasury, and x402 — aligned with ERC-8004.",
      path: "/agent-fleet",
      keywords: ["BUILDCHAIN", "ERC-8004", "agents", "AI", "orchestration"],
    }),
  loader: async () => {
    try {
      const dashboard = await postAgentFleetDashboard({ data: {} });
      return { dashboard };
    } catch (e) {
      console.warn("/agent-fleet loader:", e);
      return { dashboard: null };
    }
  },
  component: AgentFleetPage,
});

function AgentFleetPage() {
  const { dashboard } = Route.useLoaderData();
  const examplePlan = planOrchestration("social_burst");

  return (
    <MarketingShell
      eyebrow="Operations layer"
      tone="slate"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Eleven agents — <span className="text-zinc-100">one orchestrated fleet</span>
        </>
      }
      subtitle="CEO routing, growth & social (including a funded marketing wallet), trading personas for BCD treasury discipline, and x402 monetization — designed to register on ERC-8004 ecosystems such as 8004scan."
      actions={
        <>
          <Button variant="secondary" className="rounded-full" asChild>
            <a href={ERC8004_ECOSYSTEM_LINKS.scan} target="_blank" rel="noreferrer noopener">
              Open 8004scan ↗
            </a>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/campaign" search={{ ref: undefined }}>
              Mint agent shares
            </Link>
          </Button>
          <Button variant="ghost" className="rounded-full text-zinc-300" asChild>
            <a href="/.well-known/agent.json" target="_blank" rel="noreferrer noopener">
              agent.json ↗
            </a>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-12 md:gap-14">
        <aside className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm text-amber-100/90">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium text-amber-50">Not autonomous trading advice</p>
              <p className="leading-relaxed text-amber-100/85">
                This page describes agent roles for builders. Trading and treasury execution belong
                in audited scripts, multisigs, and legal review — not in anonymous hot wallets.
                Nothing here guarantees profit or liquidity for BCD.
              </p>
            </div>
          </div>
        </aside>

        <aside className="rounded-2xl border border-emerald-500/20 bg-emerald-950/25 p-5 text-sm text-emerald-100/90">
          <p className="font-medium text-emerald-50">Guest-facing: Elias Concierge</p>
          <p className="mt-2 leading-relaxed text-emerald-100/85">
            Vienna itineraries and partner outreach from BUILDCHAIN — human approval before emails.
            Separate from mint-type fleet agents; audits to{" "}
            <span className="font-mono">AgentActionLog</span> as{" "}
            <span className="font-mono">elias-concierge-1</span>.
          </p>
          <Button variant="secondary" size="sm" className="mt-4 rounded-full" asChild>
            <Link to="/elias">Open Elias Concierge</Link>
          </Button>
        </aside>

        <section className="space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Runtime status (read-only)
          </h2>
          {!dashboard ? (
            <p className="text-sm text-zinc-500">
              Postgres not configured (<span className="font-mono">DATABASE_URL</span>) — ledger
              rows unavailable in this environment.
            </p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-zinc-400">
                <span>
                  AGENTS_PAUSED:{" "}
                  <span className={dashboard.agentsPaused ? "text-amber-400" : "text-emerald-400"}>
                    {String(dashboard.agentsPaused)}
                  </span>
                </span>
                <span>
                  ECON_LIVE:{" "}
                  <span className={dashboard.econLive ? "text-emerald-400" : "text-zinc-500"}>
                    {String(dashboard.econLive)}
                  </span>
                </span>
                <span>
                  Indexed AGS mints:{" "}
                  <span className="text-zinc-200">{dashboard.indexedMintEvents}</span>
                </span>
                <span>
                  Ledger rows (24h):{" "}
                  <span className="text-zinc-200">{dashboard.ledgerRowsLast24h}</span>
                </span>
                <span>
                  Elias concierge ledger (24h):{" "}
                  <span className="text-zinc-200">{dashboard.eliasConciergeLedger24h}</span>
                </span>
                <span>
                  ags-distributor-1 OK mints (UTC month):{" "}
                  <span className="text-zinc-200">{dashboard.agsMonthlyOkCount}</span>
                </span>
                <a
                  className="text-emerald-300/90 underline"
                  href="/api/agents/status"
                  target="_blank"
                  rel="noreferrer"
                >
                  JSON /api/agents/status ↗
                </a>
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full min-w-[640px] text-left text-xs text-zinc-400">
                  <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-zinc-600">
                    <tr>
                      <th className="px-3 py-2">time</th>
                      <th className="px-3 py-2">agent</th>
                      <th className="px-3 py-2">action</th>
                      <th className="px-3 py-2">status</th>
                      <th className="px-3 py-2">dry</th>
                      <th className="px-3 py-2">tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-zinc-600">
                          No ledger rows yet — run{" "}
                          <span className="font-mono">@bc/agent-runtime</span> tick on the server.
                        </td>
                      </tr>
                    ) : (
                      dashboard.recentLogs.map((r: AgentFleetDashboard["recentLogs"][number]) => (
                        <tr key={r.id} className="border-b border-white/[0.04]">
                          <td className="whitespace-nowrap px-3 py-2 font-mono text-[10px] text-zinc-500">
                            {r.createdAt?.slice(0, 19) ?? "—"}Z
                          </td>
                          <td className="px-3 py-2 font-mono text-zinc-300">{r.agentId}</td>
                          <td className="px-3 py-2 font-mono text-[10px]">{r.action}</td>
                          <td className="px-3 py-2">{r.status}</td>
                          <td className="px-3 py-2">{String(r.dryRun)}</td>
                          <td className="max-w-[120px] truncate px-3 py-2 font-mono text-[10px]">
                            {r.txHash ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Orchestration preview
          </h2>
          <p className="text-sm text-zinc-500">
            Example route for task key <span className="font-mono text-zinc-400">social_burst</span>
            : <span className="font-mono text-zinc-300">{examplePlan.primary.name}</span> is the
            executing agent (id <span className="font-mono">{examplePlan.primary.id}</span>). CEO{" "}
            Orchestrator (id <span className="font-mono">{CEO_AGENT_ID}</span>) still owns approvals
            and queue policy for every task type.
          </p>
          <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 font-mono text-xs text-zinc-400">
            <p className="text-zinc-300">{examplePlan.notes}</p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-zinc-600">
              Backup agents: {examplePlan.backups.map((b) => b.name).join(", ") || "—"}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Task routing keys (stub)
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {Object.entries(TASK_ROUTE_HINTS).map(([key, v]) => (
              <li
                key={key}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm"
              >
                <span className="font-mono text-emerald-200/90">{key}</span>
                <p className="mt-1 text-xs text-zinc-500">{v.notes}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {AGENT_FLEET.map((agent) => (
            <article
              key={agent.id}
              className="flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    agentTypeId {agent.id} · {agent.role}
                  </p>
                  <h3 className="font-heading text-lg font-semibold text-white">{agent.name}</h3>
                </div>
                {agent.id === CEO_AGENT_ID ? (
                  <span className="rounded-full border border-neon/35 bg-neon/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neon">
                    CEO
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-zinc-500">{agent.tagline}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-400">{agent.summary}</p>
              <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4 text-xs">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    Wallet strategy
                  </p>
                  <p className="mt-1 text-zinc-500">{agent.walletStrategy}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    Monetization hooks
                  </p>
                  <ul className="mt-1 list-inside list-disc text-zinc-500 marker:text-zinc-700">
                    {agent.monetization.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    ERC-8004 / 8004scan
                  </p>
                  <p className="mt-1 text-zinc-500">{agent.erc8004Note}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Wire-up checklist
          </h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-zinc-400 marker:text-zinc-600">
            <li>
              Register agent identities on{" "}
              <a
                href={ERC8004_ECOSYSTEM_LINKS.scan}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-zinc-200 underline"
              >
                8004scan <ExternalLink className="h-3 w-3" aria-hidden />
              </a>{" "}
              when your backends expose endpoints.
            </li>
            <li>Mint agent shares on `/campaign` — `agentTypeId` matches the fleet rows above.</li>
            <li>
              Monetize HTTP APIs with x402 (`/api/x402/premium`) for the x402 Monetization agent
              story.
            </li>
            <li>
              Move BCD / ETH only through treasury policy — extend `@bc/bcd-orchestration` /
              Temporal worker on the server with real queues.
            </li>
          </ol>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/faq">FAQ</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/genesis-district">Genesis District</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  );
}
