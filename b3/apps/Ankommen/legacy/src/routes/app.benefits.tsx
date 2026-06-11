import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/benefits")({
  component: Benefits,
});

const steps = [
  { q: "What is your nationality?", options: ["EU citizen", "Non-EU", "Refugee", "Austrian"] },
  { q: "Your age?", options: ["Under 18", "18–30", "31–50", "50+"] },
  { q: "Residence status?", options: ["Permanent", "Temporary", "Asylum", "Other"] },
  { q: "Are you working?", options: ["Yes, full-time", "Yes, part-time", "No", "Looking"] },
  { q: "Do you have children?", options: ["0", "1", "2", "3+"] },
  { q: "Marital status?", options: ["Single", "Married", "Partnered", "Other"] },
  { q: "Monthly income?", options: ["€0", "€1–800", "€800–1,500", "€1,500+"] },
];

function Benefits() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const next = () => (step + 1 < steps.length ? setStep(step + 1) : setDone(true));

  if (done) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border bg-card p-8 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-4 w-4" /> Personalized estimate</div>
          <div className="mt-3 text-sm text-muted-foreground">Your possible benefits</div>
          <div className="mt-1 text-5xl font-extrabold gradient-text">€1,840 / mo</div>
        </div>
        <div className="space-y-3">
          {[
            { name: "Familienbeihilfe", amount: "€280", desc: "Child support per child" },
            { name: "AMS Notstandshilfe", amount: "€820", desc: "Unemployment assistance" },
            { name: "Wohnbeihilfe", amount: "€240", desc: "Housing subsidy (Vienna)" },
            { name: "Mindestsicherung", amount: "€500", desc: "Minimum income support" },
          ].map((b) => (
            <div key={b.name} className="flex items-center justify-between rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.desc}</div>
                </div>
              </div>
              <div className="text-lg font-bold text-primary">{b.amount}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Learn More</button>
          <button className="rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-success-foreground">How to Apply</button>
          <button className="rounded-full border px-5 py-2.5 text-sm font-semibold">Generate Checklist</button>
        </div>
      </div>
    );
  }

  const s = steps[step];
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
          <button key={o} onClick={next} className="rounded-2xl border bg-card p-5 text-left font-medium shadow-soft transition hover:-translate-y-0.5 hover:border-primary hover:shadow-glow">
            {o}
          </button>
        ))}
      </div>
      <button onClick={next} className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        Skip <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
