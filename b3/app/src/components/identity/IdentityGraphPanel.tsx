import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import {
  identityGraphNodeUrl,
  platformLabel,
  type IdentityGraphNode,
} from "@/lib/identity/identity-graph-types";

const PLATFORM_COLORS: Record<string, string> = {
  ens: "#5298FF",
  farcaster: "#8B5CF6",
  lens: "#ABFE2C",
  basenames: "#0052FF",
  linea: "#61DFFF",
  twitter: "#FFFFFF",
  ethereum: "#627EEA",
  culture: "#C5FF41",
};

function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toLowerCase()] ?? "#00E5FF";
}

function GraphNodeChip({ node, compact = false }: { node: IdentityGraphNode; compact?: boolean }) {
  const color = platformColor(node.platform);
  const href = identityGraphNodeUrl(node);
  const className = compact
    ? "flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-white/25 hover:bg-white/[0.07]"
    : "flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center transition hover:border-white/25 hover:bg-white/[0.07]";

  const inner = (
    <>
      <div
        className="relative shrink-0 overflow-hidden rounded-full border-2 bg-zinc-900"
        style={{ borderColor: `${color}80`, width: compact ? 36 : 48, height: compact ? 36 : 48 }}
      >
        {node.avatar ? (
          <img src={node.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-mono text-[10px] font-bold uppercase"
            style={{ color }}
          >
            {node.platform.slice(0, 2)}
          </div>
        )}
      </div>
      <div className={compact ? "min-w-0 flex-1" : "w-full min-w-0"}>
        <p className="truncate text-xs font-semibold text-white">{node.displayName}</p>
        <p className="truncate font-mono text-[10px] text-zinc-500">
          {platformLabel(node.platform)}
        </p>
        {node.followerCount != null && node.followerCount > 0 ? (
          <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
            {node.followerCount.toLocaleString()} followers
          </p>
        ) : null}
      </div>
      {href ? <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden /> : null}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

type Props = {
  cultureName: string;
  graph: IdentityGraphNode[];
  readOnly?: boolean;
  subtitle?: string;
};

export function IdentityGraphPanel({
  cultureName,
  graph,
  readOnly = false,
  subtitle = "Linked identities across ENS, Farcaster, Lens, Linea, and more.",
}: Props) {
  const orbitNodes = graph.slice(0, 8);

  return (
    <section className="space-y-5">
      <SectionHeading title="Identity Graph" subtitle={subtitle} />
      <GlassCard hover={false} className="relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(197_255_65/0.06),transparent_65%)]" />

        {/* Desktop orbit */}
        <div className="relative mx-auto hidden aspect-square w-full max-w-md md:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-[#C5FF41]/50 bg-[#C5FF41]/10 text-center shadow-[0_0_40px_-10px_#C5FF41]">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#C5FF41]/80">
                Culture Layer
              </p>
              <p className="mt-1 px-2 font-display text-sm font-bold leading-tight text-white">
                {cultureName}
              </p>
            </div>
          </div>

          {orbitNodes.map((node, i) => {
            const angle = (i / orbitNodes.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 42;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            const color = platformColor(node.platform);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="absolute w-[88px] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className="absolute left-1/2 top-1/2 -z-10 h-px origin-left opacity-30"
                  style={{
                    width: `${radius * 0.55}%`,
                    transform: `rotate(${(angle * 180) / Math.PI + 180}deg)`,
                    background: `linear-gradient(to right, ${color}, transparent)`,
                  }}
                  aria-hidden
                />
                <GraphNodeChip node={node} />
              </motion.div>
            );
          })}
        </div>

        {/* Mobile stacked cards */}
        <div className="space-y-2 md:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#C5FF41]/35 bg-[#C5FF41]/10 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C5FF41]/50 bg-black font-display text-lg font-bold text-[#C5FF41]">
              CL
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#C5FF41]/80">
                Culture Layer
              </p>
              <p className="font-display font-bold text-white">{cultureName}</p>
            </div>
          </div>
          {orbitNodes.map((node) => (
            <GraphNodeChip key={node.id} node={node} compact />
          ))}
        </div>

        {graph.length > 8 ? (
          <p className="mt-4 text-center text-xs text-zinc-500">
            +{graph.length - 8} more linked {graph.length - 8 === 1 ? "identity" : "identities"}
          </p>
        ) : null}

        {!readOnly ? (
          <p className="mt-6 text-center text-[10px] text-zinc-600">
            Identity graph powered by{" "}
            <a
              href="https://web3.bio"
              target="_blank"
              rel="noreferrer noopener"
              className="text-zinc-400 hover:text-white"
            >
              Web3.bio
            </a>
          </p>
        ) : null}
      </GlassCard>
    </section>
  );
}

export function LinkedIdentitiesGrid({ graph }: { graph: IdentityGraphNode[] }) {
  if (graph.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionHeading
        title="Linked identities"
        subtitle="Verified profiles connected to this Culture Layer owner."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {graph.map((node) => (
          <GraphNodeChip key={node.id} node={node} compact />
        ))}
      </div>
    </section>
  );
}
