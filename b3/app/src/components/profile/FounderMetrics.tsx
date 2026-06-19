import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import type { FounderShowcaseConfig } from "@/lib/profile/founder-showcase";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
};

function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <GlassCard hover className="flex min-h-[100px] flex-col justify-between p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <div>
        <p className="font-display text-2xl font-bold tabular-nums text-white md:text-3xl">
          {value}
        </p>
        {subtitle ? <p className="mt-1 text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
    </GlassCard>
  );
}

type FounderMetricsProps = {
  config: FounderShowcaseConfig;
  followerCount: number | null;
  resolved: ResolvedCultureName;
};

export function FounderMetrics({ config, followerCount, resolved }: FounderMetricsProps) {
  const metrics = config.metrics;
  const followers = followerCount ?? metrics.followerFallback;
  const isTokenOne = resolved.tokenId === "1";
  const scoreFormatted = config.cultureScore.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return (
    <section className="space-y-5">
      <SectionHeading
        title="Building Culture Metrics"
        subtitle="Proof-first signal for investors, partners, and builders."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Followers"
          value={followers.toLocaleString()}
          subtitle="Farcaster reach"
        />
        <MetricCard
          label="Culture Score"
          value={scoreFormatted}
          subtitle={config.cultureScoreNote}
        />
        <MetricCard label="Products" value={metrics.productCountLabel} subtitle="Ecosystem apps" />
        <MetricCard
          label="Founder Identity"
          value="1"
          subtitle={isTokenOne ? "Culture Layer #1" : "Culture Layer name"}
        />
        <MetricCard label="Network" value="Base" subtitle="Mainnet" />
        <MetricCard
          label="Community Owned"
          value={metrics.communityOwnedLabel}
          subtitle="Member-driven"
        />
      </div>
    </section>
  );
}
