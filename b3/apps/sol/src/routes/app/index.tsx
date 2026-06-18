"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ArrowRight, Flame, Trophy, Zap } from "lucide-react";

import { useBuilder } from "@/hooks/use-builder";
import { useClaimReward } from "@/hooks/use-claim-reward";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="border border-border bg-surface p-6">
      <Icon className="h-6 w-6 text-signal" strokeWidth={1.5} />
      <div className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-4xl font-bold">{value}</div>
    </div>
  );
}

function DashboardPage() {
  const { builder, walletAddress, refetch } = useBuilder();
  const claimMutation = useClaimReward(walletAddress);

  if (!builder) return null;

  const today = builder.todayMission;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-signal">Builder OS</p>
        <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">Dashboard</h1>
        <p className="mt-4 text-muted-foreground">
          {builder.enrolledPathTitle
            ? `Enrolled in ${builder.enrolledPathTitle}`
            : "Pick a path to specialize your missions."}
        </p>
      </div>

      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="XP" value={builder.xp} icon={Zap} />
        <StatCard label="Streak" value={`${builder.streak}🔥`} icon={Flame} />
        <StatCard label="Builder Score" value={builder.builderScore} icon={Trophy} />
        <StatCard label="Pending Claims" value={builder.pendingClaims} icon={ArrowRight} />
      </div>

      {today && (
        <section className="mt-12 border border-border bg-surface p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-signal">
            Today&apos;s mission
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold">{today.title}</h2>
          <p className="mt-3 text-muted-foreground">{today.description}</p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            +{today.xpReward} XP · +{today.bccReward} BCC
            {today.nftAchievementKey ? " · NFT" : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {today.status === "available" && (
              <Link
                to="/app/missions"
                className="inline-flex items-center gap-2 bg-signal px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground"
              >
                View missions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {today.status === "claimable" && (
              <button
                type="button"
                disabled={claimMutation.isPending}
                onClick={async () => {
                  await claimMutation.mutateAsync(today.slug);
                  await refetch();
                }}
                className="bg-signal px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground disabled:opacity-50"
              >
                {claimMutation.isPending ? "Claiming..." : "Claim reward"}
              </button>
            )}
            {today.status === "claimed" && (
              <span className="border border-signal/40 px-5 py-3 font-mono text-xs uppercase tracking-widest text-signal">
                Completed
              </span>
            )}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/app/missions"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-signal"
        >
          All missions →
        </Link>
        <Link
          to="/app/profile"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-signal"
        >
          Enroll in a path →
        </Link>
      </div>
    </div>
  );
}
