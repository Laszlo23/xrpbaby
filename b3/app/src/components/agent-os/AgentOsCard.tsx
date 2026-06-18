import type { AgentOsAgent, AgentOsStatus } from "@/lib/agent-os-catalog";
import { Link } from "@tanstack/react-router";

const STATUS_STYLES: Record<AgentOsStatus, string> = {
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  beta: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  coming_soon: "border-zinc-600/40 bg-zinc-800/40 text-zinc-400",
};

const STATUS_LABEL: Record<AgentOsStatus, string> = {
  live: "Live",
  beta: "Beta",
  coming_soon: "Coming soon",
};

export function AgentOsCard({ agent }: { agent: AgentOsAgent }) {
  return (
    <article className="flex flex-col rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold text-white">{agent.name}</h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_STYLES[agent.status]}`}
        >
          {STATUS_LABEL[agent.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-500">{agent.purpose}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{agent.mainJob}</p>
      <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-500">
        {agent.priceLabel ? (
          <p>
            <span className="text-zinc-600">Price: </span>
            {agent.priceLabel}
          </p>
        ) : null}
        <p>
          <span className="text-zinc-600">Approval: </span>
          {agent.approvalNeeded ? "Human approval for outbound actions" : "Research-only (no outbound)"}
        </p>
        {agent.ctaRoute && agent.ctaLabel ? (
          <Link
            to={agent.ctaRoute}
            className="inline-flex text-sm font-semibold text-[#C5FF41] hover:text-white"
          >
            {agent.ctaLabel} →
          </Link>
        ) : agent.id === "research_agent" ? (
          <a href="#research-agent" className="inline-flex text-sm font-semibold text-emerald-300 hover:text-white">
            Try below →
          </a>
        ) : agent.id === "limx_revenue_agent" ? (
          <a href="#limx-agent" className="inline-flex text-sm font-semibold text-violet-300 hover:text-white">
            Try below →
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function AgentOsStatsStrip({
  researchPrice,
  limxPrice,
  bccCirculatingWei,
  activityLast24h,
}: {
  researchPrice: string;
  limxPrice?: string;
  bccCirculatingWei: string | null;
  activityLast24h: number | null;
}) {
  const circulating =
    bccCirculatingWei != null
      ? `${(Number(bccCirculatingWei) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 0 })} BCC est. circulating`
      : "BCC metrics loading…";

  const items = [
    { label: "Research query", value: researchPrice + " USDC" },
    ...(limxPrice ? [{ label: "Limx brief", value: limxPrice + " USDC" }] : []),
    { label: "Ecosystem", value: circulating },
    {
      label: "Agent activity (24h)",
      value: activityLast24h != null ? String(activityLast24h) : "—",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">{item.label}</p>
          <p className="mt-1 font-mono text-sm text-zinc-200">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
