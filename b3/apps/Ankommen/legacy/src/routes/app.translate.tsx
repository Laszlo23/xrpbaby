import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRightLeft, Sparkles, Building2 } from "lucide-react";

export const Route = createFileRoute("/app/translate")({
  component: Translate,
});

const languages = ["German", "English", "Arabic", "Turkish", "Ukrainian", "Russian", "Romanian", "Farsi", "Serbian", "Croatian", "Bosnian"];

function Translate() {
  const [from, setFrom] = useState("German");
  const [to, setTo] = useState("English");
  const [text, setText] = useState("Sie werden gebeten, am 28. Juni 2026 bei der MA35 zu erscheinen.");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Translation</h1>
        <p className="mt-1 text-muted-foreground">Translate with government context, not just words.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-full border bg-card px-4 py-2 text-sm">
          {languages.map((l) => <option key={l}>{l}</option>)}
        </select>
        <button onClick={() => { setFrom(to); setTo(from); }} className="grid h-9 w-9 place-items-center rounded-full border bg-card hover:bg-secondary"><ArrowRightLeft className="h-4 w-4" /></button>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-full border bg-card px-4 py-2 text-sm">
          {languages.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold text-muted-foreground">{from} · Original</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="mt-3 w-full resize-none border-0 bg-transparent text-base outline-none" />
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-soft" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <div className="text-xs font-semibold text-primary">{to} · Translation</div>
          <p className="mt-3 text-base font-medium">You are asked to appear at MA35 on 28 June 2026.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold text-success"><Sparkles className="h-4 w-4" /> Simple explanation</div>
          <p className="mt-3 text-sm text-muted-foreground">This letter tells you to go to a government office (MA35) on June 28. Bring your ID and any documents they listed.</p>
        </div>
        <div className="rounded-3xl border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Building2 className="h-4 w-4" /> Government context</div>
          <p className="mt-3 text-sm text-muted-foreground">MA35 is Vienna's immigration office (Magistratsabteilung 35). It handles residence permits and registrations.</p>
        </div>
      </div>
    </div>
  );
}
