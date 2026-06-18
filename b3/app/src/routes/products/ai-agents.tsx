import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { ProductPageLayout } from "@/components/products/ProductPageLayout";
import { AGENT_FLEET } from "@/lib/bcd-agent-fleet";
import { productById } from "@/lib/landing-copy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/ai-agents")({
  head: () =>
    pageHead({
      title: "AI Agents — Community-Powered Workforce",
      description:
        "Grant, community, marketing, partnership, research, and content agents — coordinated AI workforce for Building Culture.",
      path: "/products/ai-agents",
      keywords: ["AI agents", "agent fleet", "ERC-8004", "Building Culture", "community AI"],
    }),
  component: AiAgentsProductPage,
});

function AiAgentsProductPage() {
  const pillar = productById("ai-agents");
  const featured = AGENT_FLEET.slice(0, 6);

  return (
    <ProductPageLayout pillar={pillar}>
      <div className="space-y-6">
        <div className="space-y-4 text-zinc-300">
          <h2 className="font-display text-2xl font-bold text-white">Eleven agents, one fleet</h2>
          <p>
            Community-powered AI agents handle growth, social, grants, treasury coordination, and
            research — with on-chain agent share NFTs and ERC-8004-aligned identity notes.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {featured.map((agent) => (
            <li key={agent.slug} className="rounded-2xl bc-glass p-4">
              <p className="text-sm font-semibold text-white">{agent.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{agent.tagline}</p>
            </li>
          ))}
        </ul>
        <Link
          to="/agent-os"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C5FF41] hover:text-white"
        >
          Open Agent OS dashboard
          <ArrowUpRight size={14} />
        </Link>
        <Link
          to="/agent-fleet"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Ops fleet dashboard
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </ProductPageLayout>
  );
}
