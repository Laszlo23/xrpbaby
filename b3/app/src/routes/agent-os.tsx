import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, ExternalLink, ShieldAlert } from "lucide-react";

import { AgentOsCard, AgentOsStatsStrip } from "@/components/agent-os/AgentOsCard";
import { BccAgentAccessBanner } from "@/components/agent-os/BccAgentAccessBanner";
import { GrantPanel } from "@/components/agent-os/GrantPanel";
import { LimxPanel } from "@/components/agent-os/LimxPanel";
import { ResearchPanel } from "@/components/agent-os/ResearchPanel";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { getAgentOsOverviewFn } from "@/lib/agent-os-overview-fn";
import type { AgentOsAgent } from "@/lib/agent-os-catalog";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/agent-os")({
  head: () =>
    pageHead({
      title: "Agent OS — Crypto-Paid AI Agents",
      description:
        "Building Culture Agent OS: four Layer-3 agents. Pay with BCC or USDC on Base. Grant Agent MVP live.",
      path: "/agent-os",
      keywords: ["Agent OS", "x402", "Building Culture", "AI agents", "Base", "research"],
    }),
  loader: async () => {
    try {
      const overview = await getAgentOsOverviewFn();
      return { overview };
    } catch (e) {
      console.warn("/agent-os loader:", e);
      return { overview: null };
    }
  },
  component: AgentOsPage,
});

function AgentOsPage() {
  const { overview } = Route.useLoaderData();
  const agents: AgentOsAgent[] = overview?.agents ?? [];
  const researchPrice = overview?.researchPrice ?? "$0.05";
  const limxPrice = overview?.limxPrice ?? "$0.25";

  return (
    <MarketingShell
      eyebrow="Agent OS"
      tone="cyan"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Building Culture <span className="text-emerald-300/90">Agent OS</span>
        </>
      }
      subtitle={
        overview?.project.tagline ??
        "What can you do? Research, grants, marketing, and building — paid with BCC or USDC."
      }
      actions={
        <>
          <Button variant="secondary" className="rounded-full" asChild>
            <a href="/.well-known/agent.json" target="_blank" rel="noreferrer noopener">
              agent.json ↗
            </a>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/trading-agent">Trading agent (x402)</Link>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-12 md:gap-14">
        <aside className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm text-amber-100/90">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium text-amber-50">Human-approved operations</p>
              <p className="leading-relaxed text-amber-100/85">
                No autonomous treasury moves. Revenue, partnerships, grants, and outbound messages
                stay human-approved. Research and read-only APIs are the first live surfaces.
              </p>
            </div>
          </div>
        </aside>

        <BccAgentAccessBanner />

        {overview ? (
          <AgentOsStatsStrip
            researchPrice={researchPrice}
            limxPrice={limxPrice}
            bccCirculatingWei={overview.ecosystem.bccCirculatingWei}
            activityLast24h={overview.ecosystem.activityLast24h}
          />
        ) : null}

        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">Agent fleet</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {agents.map((agent) => (
              <AgentOsCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        <LimxPanel limxPrice={limxPrice} />

        <GrantPanel />

        <ResearchPanel researchPrice={researchPrice} />

        <section className="space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Paid APIs & identity
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-400">
            <li className="rounded-xl border border-white/[0.06] px-4 py-3">
              <Link to="/trading-agent" className="font-semibold text-zinc-200 hover:text-white">
                Trading agent
              </Link>
              <p className="mt-1 text-xs">Aerodrome quotes on Base — x402 per call</p>
            </li>
            <li className="rounded-xl border border-white/[0.06] px-4 py-3">
              <a
                href="/.well-known/agent.json"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-semibold text-zinc-200 hover:text-white"
              >
                Machine-readable offers <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-xs">ERC-8004 / A2A discovery for other agents</p>
            </li>
            <li className="rounded-xl border border-white/[0.06] px-4 py-3">
              <a
                href="https://wallet.blockchain0x.com/a/limx"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-semibold text-zinc-200 hover:text-white"
              >
                Limx agent wallet <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-xs">Non-custodial USDC wallet on Base — pay or scan to fund Limx</p>
            </li>
            <li className="rounded-xl border border-white/[0.06] px-4 py-3">
              <Link to="/0g/agentid" className="font-semibold text-zinc-200 hover:text-white">
                0G Agent ID
              </Link>
              <p className="mt-1 text-xs">On-chain agent identity proof</p>
            </li>
            <li className="rounded-xl border border-white/[0.06] px-4 py-3">
              <Link to="/grant-proof" className="font-semibold text-zinc-200 hover:text-white">
                Grant Proof
              </Link>
              <p className="mt-1 text-xs">Contribution proof for funding applications</p>
            </li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/products/ai-agents">AI agents product</Link>
          </Button>
          <Button variant="ghost" className="rounded-full text-zinc-400" asChild>
            <Link to="/agent-fleet">Ops dashboard (internal)</Link>
          </Button>
          <Button variant="ghost" className="rounded-full text-zinc-400" asChild>
            <Link to="/faq">FAQ</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  );
}
