"use client";

import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { Flame, Sparkles } from "lucide-react";

import { CommunityStakeCard } from "@/components/members/CommunityStakeCard";
import { BuildFocusPicker } from "@/components/members/BuildFocusPicker";
import { DeliverableCard } from "@/components/members/DeliverableCard";
import { ProgressRing } from "@/components/members/ProgressRing";

export const Route = createFileRoute("/members/")({
  component: MembersHome,
});

function MembersHome() {
  const { member } = useRouteContext({ from: "/members" });

  const activeDay = member.progress.maxUnlockDay;
  const todayItems = member.deliverables.filter(
    (d) => !d.isLocked && d.dayNumber === activeDay,
  );
  const dayZeroItems = member.deliverables.filter(
    (d) => !d.isLocked && d.dayNumber === 0 && activeDay > 0,
  );
  const showDayZero = activeDay === 0;
  const displayItems = showDayZero
    ? member.deliverables.filter((d) => !d.isLocked && d.dayNumber <= 1)
    : [...todayItems, ...dayZeroItems.filter((d) => !d.completedAt)];

  const recentAchievements = member.achievements.slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-signal">
            Day {activeDay} · week one
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Welcome, {member.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 text-muted-foreground">
            {member.trackTitle}
            {member.buildFocus && (
              <>
                {" "}
                · building{" "}
                <span className="text-foreground">
                  {member.buildFocus === "all" ? "everything" : member.buildFocus}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {member.streak > 0 && (
            <div className="flex items-center gap-2 border border-border px-4 py-3">
              <Flame className="h-5 w-5 text-signal" />
              <div>
                <div className="font-display text-2xl font-bold">{member.streak}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  day streak
                </div>
              </div>
            </div>
          )}
          <ProgressRing percent={member.progress.percent} />
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        {member.progress.completedCount}/{member.progress.totalUnlocked} unlocked items complete
      </p>

      <CommunityStakeCard
        summary={member.communityStake}
        walletAddress={member.proof.walletAddress}
      />

      {member.proof.status === "eligible" && !member.proof.txSignature && (
        <Link
          to="/members/progress"
          className="mt-8 flex items-center justify-between border border-signal/30 bg-signal/5 px-5 py-4 transition-colors hover:border-signal/50"
        >
          <span className="text-sm">
            Your proof score is eligible ({member.proof.score}/{member.proof.threshold}) — anchor
            on-chain to unlock payouts
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-signal">
            Proof →
          </span>
        </Link>
      )}

      {(!member.mood.morningDone || !member.mood.eveningDone) && (
        <Link
          to="/members/mood"
          className="mt-8 flex items-center justify-between border border-signal/30 bg-signal/5 px-5 py-4 transition-colors hover:border-signal/50"
        >
          <span className="text-sm">
            {!member.mood.morningDone && !member.mood.eveningDone
              ? "Log your morning energy and evening mood"
              : !member.mood.morningDone
                ? "Log your morning energy"
                : "Log your evening mood"}
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-signal">
            Mood →
          </span>
        </Link>
      )}

      {!member.buildFocus && (
        <div className="mt-8">
          <BuildFocusPicker />
        </div>
      )}

      {recentAchievements.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {recentAchievements.map((a) => (
            <div
              key={a.slug}
              className="flex items-center gap-2 border border-signal/20 bg-signal/5 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-signal" />
              <span className="font-mono text-[10px] uppercase tracking-widest">{a.title}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 space-y-px border border-border bg-border">
        {displayItems.map((d) => (
          <DeliverableCard key={d.slug} item={d} identity={member.identity} />
        ))}
      </div>

      {displayItems.length === 0 && (
        <p className="mt-10 text-muted-foreground">
          You&apos;re caught up for today. Check your{" "}
          <a href="/members/journal" className="text-signal hover:underline">
            journal
          </a>{" "}
          or review{" "}
          <a href="/members/progress" className="text-signal hover:underline">
            proof
          </a>
          .
        </p>
      )}
    </div>
  );
}
