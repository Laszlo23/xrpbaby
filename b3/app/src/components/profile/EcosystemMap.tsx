import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import {
  ecosystemNodeHref,
  isExternalEcosystemNode,
  type EcosystemNode,
  type FounderShowcaseConfig,
} from "@/lib/profile/founder-showcase";

function EcosystemNodeChip({ node }: { node: EcosystemNode }) {
  const href = ecosystemNodeHref(node);
  const external = isExternalEcosystemNode(node);
  const className =
    "inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-[#00E5FF]/30 hover:bg-white/[0.07] hover:text-white";

  if (!href) {
    return <span className={className}>{node.label}</span>;
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {node.label}
        <ExternalLink className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {node.label}
    </Link>
  );
}

export function EcosystemMap({ config }: { config: FounderShowcaseConfig }) {
  return (
    <section className="space-y-5">
      <SectionHeading
        title="Building Culture Ecosystem"
        subtitle="One culture layer — many products, agents, and onchain rails."
      />
      <GlassCard hover={false} className="relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-[radial-gradient(circle,rgb(0_229_255/0.15),transparent_70%)]" />
            <div className="relative rounded-2xl border border-[#00E5FF]/35 bg-[#00E5FF]/10 px-6 py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00E5FF]/80">
                Root
              </p>
              <p className="mt-1 font-display text-lg font-bold text-white">
                {config.ecosystemRoot}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-gradient-to-b from-[#00E5FF]/50 to-white/10" aria-hidden />

          <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
            {config.ecosystemNodes.map((node) => (
              <div key={node.id} className="flex items-center gap-2">
                <span className="hidden font-mono text-zinc-600 sm:inline" aria-hidden>
                  ├─
                </span>
                <EcosystemNodeChip node={node} />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
