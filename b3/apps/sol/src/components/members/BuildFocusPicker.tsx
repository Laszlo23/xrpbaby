"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { setBuildFocus } from "@/lib/api/member.functions";

const OPTIONS = [
  { id: "life" as const, label: "Real life", hint: "Habits, body, relationships, environment" },
  { id: "digital" as const, label: "Digital", hint: "Product, content, code, business online" },
  { id: "mind" as const, label: "Mind", hint: "Clarity, identity, discipline, inner game" },
  { id: "all" as const, label: "All of it", hint: "Full reset — life, digital, and mind" },
];

export function BuildFocusPicker() {
  const router = useRouter();

  const pick = useMutation({
    mutationFn: (focus: (typeof OPTIONS)[number]["id"]) => setBuildFocus({ data: { focus } }),
    onSuccess: () => {
      toast.success("Build focus set.");
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="border border-signal/30 bg-signal/5 p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-signal">First step</p>
      <h2 className="mt-2 font-display text-2xl font-bold">What are you building?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        RESET works for whatever you&apos;re creating — in real life, digital, or in your mind.
      </p>
      <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={pick.isPending}
            onClick={() => pick.mutate(opt.id)}
            className="bg-background p-4 text-left transition-colors hover:bg-surface"
          >
            <div className="font-display text-lg font-semibold">{opt.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{opt.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
