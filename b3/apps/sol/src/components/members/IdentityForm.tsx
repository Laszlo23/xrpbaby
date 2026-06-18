"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { saveIdentity } from "@/lib/api/member.functions";

const FIELDS = [
  { key: "q1" as const, label: "I am the kind of person who" },
  { key: "q2" as const, label: "I no longer tolerate" },
  { key: "q3" as const, label: "My non-negotiable daily standard is" },
  { key: "q4" as const, label: "When I'm tempted to slip, I will" },
  { key: "q5" as const, label: "90 days from now, people will say I" },
];

type IdentityFormProps = {
  initial: Record<string, string>;
};

export function IdentityForm({ initial }: IdentityFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    q1: initial.q1 ?? "",
    q2: initial.q2 ?? "",
    q3: initial.q3 ?? "",
    q4: initial.q4 ?? "",
    q5: initial.q5 ?? "",
  });

  const save = useMutation({
    mutationFn: () => saveIdentity({ data: values }),
    onSuccess: () => {
      toast.success("Identity saved — that's your proof.");
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filled = Object.values(values).every((v) => v.trim().length > 0);

  return (
    <div className="space-y-4">
      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {f.label}
          </span>
          <input
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            className="mt-2 w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-signal"
            placeholder="Present tense — as if it's already true"
          />
        </label>
      ))}
      <button
        type="button"
        onClick={() => save.mutate()}
        disabled={save.isPending || !filled}
        className="bg-signal px-6 py-3 font-mono text-xs uppercase tracking-widest text-signal-foreground disabled:opacity-50"
      >
        {save.isPending ? "Saving..." : "Sign & save declaration"}
      </button>
    </div>
  );
}
