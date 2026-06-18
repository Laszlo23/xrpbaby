"use client";

import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { DeliverableCard } from "@/components/members/DeliverableCard";

export const Route = createFileRoute("/members/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { member } = useRouteContext({ from: "/members" });
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const byDay = member.deliverables.reduce<Record<number, typeof member.deliverables>>(
    (acc, d) => {
      if (!acc[d.dayNumber]) acc[d.dayNumber] = [];
      acc[d.dayNumber].push(d);
      return acc;
    },
    {},
  );

  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <h1 className="font-display text-4xl font-bold">Your library</h1>
      <p className="mt-3 text-muted-foreground">
        Everything unlocked for your membership — tap to open, work, and mark done.
      </p>

      <div className="mt-10 space-y-8">
        {days.map((day) => (
          <section key={day}>
            <h2 className="font-mono text-xs uppercase tracking-widest text-signal">
              Day {day}
            </h2>
            <div className="mt-4 space-y-px border border-border bg-border">
              {byDay[day].map((d) => (
                <div key={d.slug} className="bg-background">
                  <button
                    type="button"
                    onClick={() => setOpenSlug(openSlug === d.slug ? null : d.slug)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-surface"
                  >
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {d.type}
                        {d.isLocked && " · locked"}
                        {d.completedAt && " · done"}
                      </div>
                      <div className="mt-1 font-display text-lg font-semibold">{d.title}</div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openSlug === d.slug ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openSlug === d.slug && (
                    <div className="border-t border-border">
                      <DeliverableCard item={d} identity={member.identity} compact />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
