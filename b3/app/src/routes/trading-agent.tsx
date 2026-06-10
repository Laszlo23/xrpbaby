import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Coins, Shield, Zap } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { TradingAgentHealthBanner } from "@/components/TradingAgentHealthBanner";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/trading-agent")({
  head: () =>
    pageHead({
      title: "Rentable Trading Agent",
      description:
        "Pay-per-call Aerodrome quotes on Base via x402. Built for BCDAI, autonomous agents, and copy-trading stacks.",
      path: "/trading-agent",
      keywords: ["trading agent", "x402", "Aerodrome", "BCC", "Base"],
    }),
  component: TradingAgentPage,
});

function TradingAgentPage() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://app.buildingcultureid.space";

  return (
    <MarketingShell
      eyebrow="Agent infrastructure"
      tone="cyan"
      title={<>Rent the {BRAND_DISPLAY_NAME} trading agent</>}
      subtitle="Aerodrome routing on Base powered by Velodrome sugar-sdk. Agents pay per quote with x402 — you keep signing keys."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full">
            <a href={`${origin}/api/trading/manifest`} target="_blank" rel="noreferrer noopener">
              API manifest
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full border-white/10">
            <a href={`${origin}/.well-known/agent.json`} target="_blank" rel="noreferrer noopener">
              agent.json
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full border-white/10">
            <Link to="/agent-fleet">Agent fleet</Link>
          </Button>
        </div>
      }
      articleClassName="max-w-3xl"
    >
      <div className="grid gap-4">
        <TradingAgentHealthBanner />
        <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 space-y-3">
          <h2 className="font-heading text-lg text-foreground">Why this wins</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex gap-2">
              <Zap className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>
                <strong className="text-zinc-100">Rentable by design</strong> — other agents pay
                x402 per quote; revenue settles to your treasury on Base.
              </span>
            </li>
            <li className="flex gap-2">
              <Bot className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>
                <strong className="text-zinc-100">Machine-readable</strong> — listed in{" "}
                <span className="font-mono text-xs">/.well-known/agent.json</span> for Marker / 8004
                directories.
              </span>
            </li>
            <li className="flex gap-2">
              <Shield className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>
                <strong className="text-zinc-100">No custody</strong> — swap previews return
                unsigned txs; BCDAI or Privy signs client-side.
              </span>
            </li>
            <li className="flex gap-2">
              <Coins className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>
                <strong className="text-zinc-100">BCC-native path</strong> — ETH→BCC quotes on
                Aerodrome, same token as the culture economy.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            SKUs (x402)
          </p>
          <ul className="mt-3 space-y-2 font-mono text-xs text-zinc-300">
            <li>
              Quote — <span className="text-zinc-100">GET /api/trading/quote</span> — default $0.05
            </li>
            <li>
              Pools — <span className="text-zinc-100">GET /api/trading/pools</span> — default $0.03
            </li>
            <li>
              Swap preview — <span className="text-zinc-100">GET /api/trading/swap-preview</span> —
              default $0.15 (unsigned calldata)
            </li>
            <li className="text-zinc-500">Free: /api/trading/health · /api/trading/manifest</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 text-sm text-zinc-400">
          <p>
            BCDAI and internal fleet agents should call the{" "}
            <strong className="text-zinc-200">platform URLs</strong> above (not the raw Python port)
            so payments and attribution stay on BUILDCHAIN. Operators run{" "}
            <span className="font-mono text-xs">packages/trading-agent</span> as a worker; see{" "}
            <span className="font-mono text-xs">docs/TRADING_AGENT_SUGAR.md</span>.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
