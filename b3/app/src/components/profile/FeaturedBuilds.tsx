import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { GlassCard, SectionHeading, StatusBadge } from "@/components/profile/profile-ui";
import {
  featuredBuildStatusLabel,
  type FeaturedBuild,
  type FeaturedBuildStatus,
} from "@/lib/profile/founder-showcase";

function statusTone(status: FeaturedBuildStatus): "live" | "beta" | "exploring" {
  return status;
}

function BuildCard({ build }: { build: FeaturedBuild }) {
  const isExternal = build.href.startsWith("http");
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold text-white">{build.title}</h3>
        <StatusBadge label={featuredBuildStatusLabel(build.status)} tone={statusTone(build.status)} />
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{build.description}</p>
      <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C5FF41]">
        View build
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </p>
    </>
  );

  if (build.href === "#") {
    return (
      <GlassCard className="flex h-full flex-col opacity-90" hover={false}>
        {inner}
        <p className="mt-2 font-mono text-[10px] text-zinc-600">Link coming soon</p>
      </GlassCard>
    );
  }

  if (isExternal) {
    return (
      <a href={build.href} target="_blank" rel="noreferrer noopener" className="block h-full">
        <GlassCard className="flex h-full flex-col" hover>
          {inner}
        </GlassCard>
      </a>
    );
  }

  return (
    <Link to={build.href} className="block h-full">
      <GlassCard className="flex h-full flex-col" hover>
        {inner}
      </GlassCard>
    </Link>
  );
}

export function FeaturedBuilds({ builds }: { builds: FeaturedBuild[] }) {
  return (
    <section className="space-y-5">
      <SectionHeading
        title="Featured Builds"
        subtitle="Products and experiments from the Building Culture founder lane."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {builds.map((build) => (
          <BuildCard key={build.id} build={build} />
        ))}
      </div>
    </section>
  );
}
