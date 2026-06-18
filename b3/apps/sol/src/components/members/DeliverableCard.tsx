"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { completeDeliverable, saveChecklist } from "@/lib/api/member.functions";

import { IdentityForm } from "./IdentityForm";

export type DeliverableItem = {
  slug: string;
  title: string;
  description: string;
  type: string;
  dayNumber: number;
  content: string;
  completedAt: string | null;
  checklistChecked: number[];
  reflectionNote: string;
  isLocked: boolean;
};

type DeliverableCardProps = {
  item: DeliverableItem;
  identity?: Record<string, string>;
  compact?: boolean;
};

function parseChecklistItems(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => /^- \[ \]/.test(line.trim()))
    .map((line) => line.replace(/^- \[ \]\s*/, "").trim());
}

export function DeliverableCard({ item, identity = {}, compact = false }: DeliverableCardProps) {
  const router = useRouter();
  const [reflection, setReflection] = useState(item.reflectionNote);
  const checklistItems = useMemo(() => parseChecklistItems(item.content), [item.content]);
  const [checked, setChecked] = useState<number[]>(item.checklistChecked);

  const saveChecks = useMutation({
    mutationFn: (next: number[]) => saveChecklist({ data: { slug: item.slug, checked: next } }),
    onError: (err: Error) => toast.error(err.message),
  });

  const complete = useMutation({
    mutationFn: () =>
      completeDeliverable({
        data: { slug: item.slug, reflectionNote: reflection || undefined },
      }),
    onSuccess: () => {
      toast.success("Marked complete.");
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleCheck = (index: number) => {
    const next = checked.includes(index)
      ? checked.filter((i) => i !== index)
      : [...checked, index].sort((a, b) => a - b);
    setChecked(next);
    saveChecks.mutate(next);
  };

  const allChecked = checklistItems.length > 0 && checked.length >= checklistItems.length;
  const proseContent = item.content
    .split("\n")
    .filter((line) => !/^- \[ \]/.test(line.trim()))
    .join("\n");

  if (item.isLocked) {
    return (
      <article className="border border-border bg-surface/50 p-6 opacity-60 md:p-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Lock className="h-4 w-4" />
          Unlocks on day {item.dayNumber}
        </div>
        <h2 className="mt-2 font-display text-xl font-bold">{item.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </article>
    );
  }

  return (
    <article className={`bg-background ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {item.type} · day {item.dayNumber}
          </span>
          <h2 className={`mt-2 font-display font-bold ${compact ? "text-xl" : "text-2xl"}`}>
            {item.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
        </div>
        {item.completedAt ? (
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-signal">
            <Check className="h-4 w-4" /> Done
          </span>
        ) : (
          <button
            type="button"
            onClick={() => complete.mutate()}
            disabled={complete.isPending || (checklistItems.length > 0 && !allChecked)}
            className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-surface disabled:opacity-50"
          >
            {checklistItems.length > 0 && !allChecked ? "Finish checklist" : "Mark done"}
          </button>
        )}
      </div>

      {item.slug === "identity-declaration" ? (
        <div className="mt-6">
          <IdentityForm initial={identity} />
        </div>
      ) : (
        <>
          {proseContent.trim() && (
            <div className="prose prose-invert mt-6 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {proseContent}
            </div>
          )}

          {checklistItems.length > 0 && (
            <ul className="mt-6 space-y-3">
              {checklistItems.map((label, i) => (
                <li key={label}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked.includes(i)}
                      onChange={() => toggleCheck(i)}
                      className="mt-1 accent-[var(--signal)]"
                    />
                    <span className={checked.includes(i) ? "text-muted-foreground line-through" : ""}>
                      {label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {(item.type === "worksheet" || item.type === "ritual") && !item.completedAt && (
            <label className="mt-6 block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Your notes (saved as proof)
              </span>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                className="mt-2 w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-signal"
                placeholder="Capture what you did — future you will need this."
              />
            </label>
          )}
        </>
      )}
    </article>
  );
}
