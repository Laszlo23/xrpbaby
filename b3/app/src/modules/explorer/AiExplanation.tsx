import { useState } from "react";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TxExplanationContent } from "@/modules/explorer/lib";

type ExplainResponse =
  | { ok: true; explanation: TxExplanationContent; cached: boolean; model: string | null }
  | { ok: false; error: string };

function ExplanationBody({ explanation }: { explanation: TxExplanationContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
          {explanation.headline}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{explanation.eli5}</p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Step by step
        </p>
        <ol className="mt-2 space-y-2">
          {explanation.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--base-blue)]/20 font-mono text-[10px] text-[var(--base-blue)]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          What this means for you
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
          {explanation.whatThisMeansForYou}
        </p>
      </div>

      {explanation.riskNotes.length > 0 ? (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Good to know
          </p>
          <ul className="mt-2 space-y-1.5">
            {explanation.riskNotes.map((note, i) => (
              <li key={i} className="text-sm leading-relaxed text-amber-100/90">
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AiExplanation({
  txHash,
  initialExplanation,
}: {
  txHash: string;
  initialExplanation: TxExplanationContent | null;
}) {
  const [explanation, setExplanation] = useState<TxExplanationContent | null>(initialExplanation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/explorer/tx/${txHash}/explain`, { method: "POST" });
      const data = (await res.json()) as ExplainResponse;
      if (data.ok) {
        setExplanation(data.explanation);
      } else if (data.error === "rate_limited") {
        setError("The explainer is busy right now — please try again in a minute.");
      } else {
        setError(
          "The AI explainer is unavailable right now. The verified facts above still tell the full story.",
        );
      }
    } catch {
      setError("Couldn't reach the explainer — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--base-blue)]/25 bg-gradient-to-b from-[var(--base-blue)]/[0.08] to-transparent p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--base-blue)]" aria-hidden />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
          Explained in plain language
        </h2>
      </div>

      {explanation ? (
        <ExplanationBody explanation={explanation} />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Want this transaction explained like you're talking to a friend — no jargon, no hex
            soup? Our AI reads the verified facts and tells you the story.
          </p>
          <Button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className="rounded-full bg-[var(--base-blue)] px-5 text-white hover:bg-[var(--base-blue)]/85"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Reading the chain…
              </>
            ) : (
              "Explain this to me"
            )}
          </Button>
          {error ? <p className="text-xs text-amber-300/90">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
