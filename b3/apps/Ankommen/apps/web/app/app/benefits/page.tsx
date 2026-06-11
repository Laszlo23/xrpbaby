"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { api } from "@ankommen/api-client";

const steps = [
  { key: "nationality", q: "What is your nationality?", options: ["EU citizen", "Non-EU", "Refugee", "Austrian"] },
  { key: "age", q: "Your age?", options: ["Under 18", "18–30", "31–50", "50+"] },
  { key: "residence", q: "Residence status?", options: ["Permanent", "Temporary", "Asylum", "Other"] },
  { key: "employment", q: "Are you working?", options: ["Yes, full-time", "Yes, part-time", "No", "Looking"] },
  { key: "children", q: "Do you have children?", options: ["0", "1", "2", "3+"] },
  { key: "marital", q: "Marital status?", options: ["Single", "Married", "Partnered", "Other"] },
  { key: "income", q: "Monthly income?", options: ["€0", "€1–800", "€800–1,500", "€1,500+"] },
];

export default function BenefitsPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ results?: { answer?: string }; disclaimer?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const select = async (value: string) => {
    const key = steps[step]?.key ?? "unknown";
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const res = await api.submitBenefitCheck(nextAnswers);
        setResult(res as typeof result);
      } catch (e) {
        setResult({ results: { answer: String(e) }, disclaimer: "Error running check" });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />;

  if (result) {
    const answer = result.results?.answer ?? "No results";
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border bg-card p-8 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-4 w-4" /> Personalized guidance</div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </div>
        <div className="rounded-2xl border border-warning-soft bg-warning-soft/30 p-4 text-sm text-muted-foreground">
          ⚠️ {result.disclaimer ?? "This is guidance only — not a guarantee of benefits. Contact AMS, BMF, or Sozialamt for official confirmation."}
        </div>
        <button onClick={() => { setResult(null); setStep(0); setAnswers({}); }} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Start over</button>
      </div>
    );
  }

  const s = steps[step];
  if (!s) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <div className="text-xs font-semibold text-primary">Step {step + 1} of {steps.length}</div>
        <h1 className="mt-1 text-3xl font-bold">{s.q}</h1>
      </header>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {s.options.map((o) => (
          <button key={o} onClick={() => select(o)} className="rounded-2xl border bg-card p-5 text-left font-medium shadow-soft transition hover:-translate-y-0.5 hover:border-primary hover:shadow-glow">{o}</button>
        ))}
      </div>
      <button onClick={() => select("skipped")} className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">Skip <ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}
