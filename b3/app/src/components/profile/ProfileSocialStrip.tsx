import { ExternalLink } from "lucide-react";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import {
  identityGraphNodeUrl,
  platformLabel,
  type IdentityGraphNode,
} from "@/lib/identity/identity-graph-types";

const PLATFORM_ACCENTS: Record<string, string> = {
  farcaster: "#8B5CF6",
  lens: "#ABFE2C",
  ens: "#5298FF",
  twitter: "#FFFFFF",
  basenames: "#0052FF",
  culture: "#C5FF41",
};

function SocialChip({ node }: { node: IdentityGraphNode }) {
  const href = identityGraphNodeUrl(node);
  const accent = PLATFORM_ACCENTS[node.platform.toLowerCase()] ?? "#00E5FF";

  const inner = (
    <>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-zinc-900"
        style={{ borderColor: `${accent}80` }}
      >
        {node.avatar ? (
          <img src={node.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="font-mono text-[10px] font-bold uppercase" style={{ color: accent }}>
            {node.platform.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{node.displayName}</p>
        <p className="truncate font-mono text-[10px] text-zinc-500">
          {platformLabel(node.platform)}
        </p>
      </div>
      {node.followerCount != null && node.followerCount > 0 ? (
        <span className="ml-auto font-mono text-[10px] text-zinc-600">
          {node.followerCount >= 1000
            ? `${(node.followerCount / 1000).toFixed(1)}k`
            : node.followerCount}
        </span>
      ) : null}
      {href ? <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden /> : null}
    </>
  );

  const className =
    "flex min-w-[200px] shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 transition hover:border-white/25 hover:bg-white/[0.04]";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function ProfileSocialStrip({ graph }: { graph: IdentityGraphNode[] }) {
  if (graph.length === 0) return null;

  const sorted = [...graph].sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0));

  return (
    <section className="space-y-4">
      <SectionHeading
        title="Social & Web3"
        subtitle="Linked profiles — tap to open Farcaster, Lens, ENS, and more."
      />
      <GlassCard hover={false} className="overflow-hidden p-4">
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sorted.map((node) => (
            <SocialChip key={node.id} node={node} />
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
