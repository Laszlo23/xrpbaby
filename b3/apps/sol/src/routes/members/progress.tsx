"use client";

import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Check, Flame, Target } from "lucide-react";

import { MoodTimelineChart } from "@/components/members/MoodTimelineChart";
import { ProofAnchorCard } from "@/components/members/ProofAnchorCard";
import { ProgressRing } from "@/components/members/ProgressRing";
import { getMoodTimeline } from "@/lib/api/member.functions";

export const Route = createFileRoute("/members/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const { member } = useRouteContext({ from: "/members" });

  const moodTimeline = useQuery({
    queryKey: ["mood-timeline"],
    queryFn: () => getMoodTimeline(),
  });

  const completed = member.deliverables.filter((d) => d.completedAt && !d.isLocked);
  const identityLines = [
    member.identity.q1,
    member.identity.q2,
    member.identity.q3,
    member.identity.q4,
    member.identity.q5,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Proof wall</p>
      <h1 className="mt-4 font-display text-4xl font-bold">What you&apos;ve built</h1>
      <p className="mt-3 text-muted-foreground">
        Evidence compounds. This is your record — life, digital, mind.
      </p>

      <section className="mt-10">
        <ProofAnchorCard linkedWallet={member.proof.walletAddress} />
      </section>

      {member.journal.recent.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Journal evidence</h2>
          <div className="mt-4 space-y-3">
            {member.journal.recent.slice(0, 3).map((entry) => (
              <div key={entry.id} className="border border-border bg-background p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Day {entry.dayNumber}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="flex flex-col items-center bg-background p-6 text-center">
          <ProgressRing percent={member.progress.percent} size={88} />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Program progress
          </p>
        </div>
        <div className="flex flex-col items-center justify-center bg-background p-6 text-center">
          <Flame className="h-8 w-8 text-signal" />
          <div className="mt-3 font-display text-4xl font-bold">{member.streak}</div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Day streak
          </p>
        </div>
        <div className="flex flex-col items-center justify-center bg-background p-6 text-center">
          <Target className="h-8 w-8 text-signal" />
          <div className="mt-3 font-display text-4xl font-bold">Day {member.programDay}</div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Of 90-day reset
          </p>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Mood timeline</h2>
          <Link
            to="/members/mood"
            className="font-mono text-[10px] uppercase tracking-widest text-signal hover:underline"
          >
            Full chart →
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Energy, inner weather, and build momentum over your reset.
        </p>
        <div className="mt-6 border border-border bg-surface p-4">
          <MoodTimelineChart points={moodTimeline.data?.points ?? []} compact />
        </div>
      </section>

      {identityLines.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Identity declaration</h2>
          <div className="mt-4 space-y-3 border border-signal/20 bg-signal/5 p-6">
            {identityLines.map((line) => (
              <p key={line} className="text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Award className="h-6 w-6 text-signal" />
          Achievements
        </h2>
        {member.achievements.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Complete your first items to earn badges.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {member.achievements.map((a) => (
              <div key={a.slug} className="border border-border bg-surface p-5">
                <div className="font-display text-lg font-semibold">{a.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                  {new Date(a.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Completed work</h2>
        <div className="mt-6 space-y-3">
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing marked done yet — start on Today.</p>
          ) : (
            completed.map((d) => (
              <div
                key={d.slug}
                className="flex items-start gap-3 border border-border bg-background p-5"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <div>
                  <div className="font-display font-semibold">{d.title}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Day {d.dayNumber} · {d.type}
                  </div>
                  {d.reflectionNote && (
                    <p className="mt-2 text-sm text-muted-foreground">{d.reflectionNote}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
