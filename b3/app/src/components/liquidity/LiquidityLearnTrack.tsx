import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIQUIDITY_LESSON_STEPS } from "@/lib/liquidity-config";

const STORAGE_KEY = "bc_liquidity_lessons_done";

function loadDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveDone(done: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
}

export function LiquidityLearnTrack({ onAllComplete }: { onAllComplete?: () => void }) {
  const [done, setDone] = useState<Set<string>>(() => loadDone());
  const [active, setActive] = useState(0);

  const step = LIQUIDITY_LESSON_STEPS[active];
  const allDone = LIQUIDITY_LESSON_STEPS.every((s) => done.has(s.id));

  function markComplete() {
    const next = new Set(done);
    next.add(step.id);
    setDone(next);
    saveDone(next);
    if (active < LIQUIDITY_LESSON_STEPS.length - 1) {
      setActive(active + 1);
    } else if (LIQUIDITY_LESSON_STEPS.every((s) => next.has(s.id))) {
      onAllComplete?.();
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Learn track · {active + 1}/{LIQUIDITY_LESSON_STEPS.length}
      </p>
      <h2 className="mt-2 font-heading text-xl font-semibold text-white">{step.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.body}</p>

      <ul className="mt-6 space-y-2">
        {LIQUIDITY_LESSON_STEPS.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            {done.has(s.id) ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle
                className={`h-4 w-4 shrink-0 ${i === active ? "text-neon" : "text-zinc-600"}`}
              />
            )}
            <button
              type="button"
              className={`text-left ${i === active ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              onClick={() => setActive(i)}
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        {!done.has(step.id) ? (
          <Button type="button" className="rounded-full" onClick={markComplete}>
            Mark step complete
          </Button>
        ) : (
          <span className="text-sm text-emerald-400">Step completed</span>
        )}
        {allDone ? (
          <span className="text-sm text-neon">All lessons done — claim Culture Points below.</span>
        ) : null}
      </div>
    </div>
  );
}

export function liquidityLessonsAllComplete(): boolean {
  const d = loadDone();
  return LIQUIDITY_LESSON_STEPS.every((s) => d.has(s.id));
}
