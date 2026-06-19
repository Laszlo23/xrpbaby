import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, ShieldCheck, Users } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import {
  MARKETPLACE_SERVICES,
  SERVICE_AGENT_LABELS,
  serviceMarginEstimateUsd,
} from "@/content/marketplace-services";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/marketplace/services/")({
  head: () =>
    pageHead({
      title: `Services — ${BRAND_DISPLAY_NAME} Marketplace`,
      description:
        "Three agent-backed deliverables — Farcaster growth, full web funnels, and Replay Guy social replies. Pay kickoff in USDC via x402 on Base.",
      path: "/marketplace/services",
      keywords: ["marketplace", "services", "x402", "USDC", "agents", "Farcaster"],
    }),
  component: MarketplaceServicesHubPage,
});

function MarketplaceServicesHubPage() {
  return (
    <div className="space-y-10 pb-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Agent delivery squad
        </p>
        <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
          Real services. Human-reviewed delivery.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Pay kickoff in USDC on Base via x402. A seven-agent squad — orchestrator, builder, QA, red
          team, growth, finance, and client success — fulfills each order with approval gates before
          anything goes live.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-black/40 p-6 md:grid-cols-3">
        <div className="flex gap-3">
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-[var(--base-blue)]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-white">5 delivery agents</p>
            <p className="mt-1 text-xs text-zinc-500">Build, test, secure, grow, orchestrate.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-[var(--vault-gold)]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-white">+2 profit loop</p>
            <p className="mt-1 text-xs text-zinc-500">
              Finance tracks margin; client success owns intake.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          <div>
            <p className="text-sm font-medium text-white">No autonomous outbound</p>
            <p className="mt-1 text-xs text-zinc-500">
              You approve posts, deploys, and milestone handoffs.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {MARKETPLACE_SERVICES.map((sku) => {
          const margin = serviceMarginEstimateUsd(sku);
          return (
            <Link
              key={sku.slug}
              to="/marketplace/services/$slug"
              params={{ slug: sku.slug }}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-black/50 p-6 transition hover:border-[rgb(212_175_55/0.35)] hover:bg-black/70"
            >
              <Badge variant="outline" className="w-fit border-white/15 text-zinc-400">
                ~{sku.estimatedDays} days
              </Badge>
              <h3 className="mt-4 font-heading text-lg font-semibold text-white group-hover:text-[var(--vault-gold)]">
                {sku.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-zinc-400">{sku.oneLiner}</p>
              <p className="mt-4 font-mono text-sm text-emerald-300/90">
                {sku.kickoffPrice} kickoff
              </p>
              {sku.retainerPrice ? (
                <p className="text-xs text-zinc-500">+ {sku.retainerPrice} ops</p>
              ) : null}
              {sku.microPrice ? <p className="text-xs text-zinc-500">or {sku.microPrice}</p> : null}
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-zinc-300 group-hover:text-white">
                View deliverables
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              <p className="mt-3 text-[10px] text-zinc-600">
                Est. sustainable margin after COGS + 25% reinvest: ~${Math.round(margin.margin)}{" "}
                USDC
              </p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-6">
        <h3 className="font-heading text-lg font-semibold text-white">Squad roles</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(SERVICE_AGENT_LABELS).map(([role, label]) => (
            <li key={role} className="text-sm text-zinc-400">
              <span className="text-zinc-200">{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
