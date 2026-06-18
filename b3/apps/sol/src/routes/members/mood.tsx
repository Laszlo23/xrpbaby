"use client";

import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmojiMoodPicker } from "@/components/members/EmojiMoodPicker";
import { MoodTimelineChart } from "@/components/members/MoodTimelineChart";
import {
  getMoodTimeline,
  saveEveningMood,
  saveMorningMood,
} from "@/lib/api/member.functions";
import {
  CHART_LINE_META,
  ENERGY_SCALE,
  INNER_SCALE,
  MOOD_QUESTIONS,
  MOMENTUM_SCALE,
} from "@/lib/mood-data";

export const Route = createFileRoute("/members/mood")({
  component: MoodPage,
});

function MoodPage() {
  const { member } = useRouteContext({ from: "/members" });
  const router = useRouter();
  const queryClient = useQueryClient();

  const timeline = useQuery({
    queryKey: ["mood-timeline"],
    queryFn: () => getMoodTimeline(),
  });

  const data = timeline.data;
  const [energySlug, setEnergySlug] = useState<string | null>(member.mood.todayEnergySlug);
  const [innerSlug, setInnerSlug] = useState<string | null>(member.mood.todayInnerSlug);
  const [momentumSlug, setMomentumSlug] = useState<string | null>(member.mood.todayMomentumSlug);

  useEffect(() => {
    if (!data?.today) return;
    setEnergySlug(data.today.energySlug);
    setInnerSlug(data.today.innerSlug);
    setMomentumSlug(data.today.momentumSlug);
  }, [data?.today]);

  const morningDone = data?.morningDone ?? member.mood.morningDone;
  const eveningDone = data?.eveningDone ?? member.mood.eveningDone;

  const saveMorning = useMutation({
    mutationFn: (slug: string) => saveMorningMood({ data: { energySlug: slug } }),
    onSuccess: () => {
      toast.success("Morning energy logged.");
      queryClient.invalidateQueries({ queryKey: ["mood-timeline"] });
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveEvening = useMutation({
    mutationFn: () => {
      if (!innerSlug || !momentumSlug) throw new Error("Pick both evening moods");
      return saveEveningMood({ data: { innerSlug, momentumSlug } });
    },
    onSuccess: () => {
      toast.success("Evening mood logged.");
      queryClient.invalidateQueries({ queryKey: ["mood-timeline"] });
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Mood timeline</p>
      <h1 className="mt-4 font-display text-4xl font-bold">How you&apos;re building</h1>
      <p className="mt-3 text-muted-foreground">
        Two check-ins a day. Three lines over time — energy, inner weather, and build momentum.
      </p>

      <section className="mt-10 border border-border bg-surface p-6 md:p-8">
        <h2 className="font-display text-xl font-bold">Your timeline</h2>
        <div className="mt-6 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-6"
              style={{ background: CHART_LINE_META.energy.color }}
            />
            {CHART_LINE_META.energy.label}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-6"
              style={{ background: CHART_LINE_META.inner.color }}
            />
            {CHART_LINE_META.inner.label}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-6"
              style={{ background: CHART_LINE_META.momentum.color }}
            />
            {CHART_LINE_META.momentum.label}
          </span>
        </div>
        <div className="mt-4">
          <MoodTimelineChart points={data?.points ?? []} />
        </div>
      </section>

      <section className="mt-8 border border-border bg-background p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Morning</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{MOOD_QUESTIONS.morning}</h2>
        {morningDone && (
          <p className="mt-2 font-mono text-xs text-signal">Logged for today</p>
        )}
        <div className="mt-6">
          <EmojiMoodPicker
            options={ENERGY_SCALE}
            value={energySlug}
            onChange={(slug) => {
              setEnergySlug(slug);
              saveMorning.mutate(slug);
            }}
            disabled={saveMorning.isPending}
          />
        </div>
      </section>

      <section className="mt-8 border border-border bg-background p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Evening</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{MOOD_QUESTIONS.eveningInner}</h2>
        {eveningDone && (
          <p className="mt-2 font-mono text-xs text-signal">Logged for today</p>
        )}
        <div className="mt-6">
          <EmojiMoodPicker
            options={INNER_SCALE}
            value={innerSlug}
            onChange={setInnerSlug}
            disabled={saveEvening.isPending}
          />
        </div>

        <h3 className="mt-10 font-display text-xl font-bold">{MOOD_QUESTIONS.eveningMomentum}</h3>
        <div className="mt-6">
          <EmojiMoodPicker
            options={MOMENTUM_SCALE}
            value={momentumSlug}
            onChange={setMomentumSlug}
            disabled={saveEvening.isPending}
          />
        </div>

        <button
          type="button"
          onClick={() => saveEvening.mutate()}
          disabled={saveEvening.isPending || !innerSlug || !momentumSlug}
          className="mt-8 bg-signal px-6 py-3 font-mono text-xs uppercase tracking-widest text-signal-foreground disabled:opacity-50"
        >
          {saveEvening.isPending ? "Saving..." : "Save evening check-in"}
        </button>
      </section>
    </div>
  );
}
