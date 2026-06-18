"use client";

import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { getJournalEntries, saveJournalEntry } from "@/lib/api/member.functions";

export const Route = createFileRoute("/members/journal")({
  component: JournalPage,
});

function JournalPage() {
  const { member } = useRouteContext({ from: "/members" });
  const router = useRouter();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(7);

  const entries = useQuery({
    queryKey: ["journal"],
    queryFn: () => getJournalEntries(),
  });

  const save = useMutation({
    mutationFn: () => saveJournalEntry({ data: { body, mood } }),
    onSuccess: () => {
      setBody("");
      toast.success("Entry saved.");
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Evening reflection</p>
      <h1 className="mt-4 font-display text-4xl font-bold">Journal</h1>
      <p className="mt-3 text-muted-foreground">
        Build in your mind first. Write what happened — no performance, just proof.
      </p>

      <div className="mt-10 border border-border bg-surface p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Today&apos;s prompt · day {member.programDay}
        </p>
        <p className="mt-3 font-display text-xl font-semibold">{member.journal.todayPrompt}</p>

        <label className="mt-6 block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Your entry
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-signal"
            placeholder="What did you protect today? What are you building toward?"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Mood (1–10): {mood}
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--signal)]"
          />
        </label>

        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending || !body.trim()}
          className="mt-6 bg-signal px-6 py-3 font-mono text-xs uppercase tracking-widest text-signal-foreground disabled:opacity-50"
        >
          {save.isPending ? "Saving..." : "Save entry"}
        </button>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Recent entries</h2>
        <div className="mt-6 space-y-4">
          {(entries.data ?? member.journal.recent).length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet. Start with tonight.</p>
          ) : (
            (entries.data ?? member.journal.recent).map((j) => (
              <article key={j.id} className="border border-border bg-background p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Day {j.dayNumber}
                  </span>
                  {j.mood != null && (
                    <span className="font-mono text-[10px] text-signal">Mood {j.mood}/10</span>
                  )}
                </div>
                <p className="mt-2 text-sm italic text-muted-foreground">{j.prompt}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{j.body}</p>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                  {new Date(j.createdAt).toLocaleString()}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
