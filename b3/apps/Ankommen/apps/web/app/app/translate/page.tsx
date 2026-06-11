"use client";

import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { api } from "@ankommen/api-client";

const langs = ["German", "English", "Arabic", "Turkish", "Ukrainian", "Russian", "Romanian", "Farsi", "Serbian", "Croatian", "Bosnian", "Polish", "Spanish", "French"];

export default function TranslatePage() {
  const [from, setFrom] = useState("German");
  const [to, setTo] = useState("English");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.translate(input, from, to) as { message: { content: string } };
      setOutput(res.message.content);
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Languages className="h-8 w-8 text-primary" /> Translation</h1>
      </header>
      <div className="flex gap-4">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border bg-card px-3 py-2 text-sm">{langs.map((l) => <option key={l}>{l}</option>)}</select>
        <span className="self-center text-muted-foreground">→</span>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border bg-card px-3 py-2 text-sm">{langs.map((l) => <option key={l}>{l}</option>)}</select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} placeholder="Paste official text…" className="rounded-3xl border bg-card p-4 shadow-soft outline-none" />
        <div className="rounded-3xl border bg-secondary/50 p-4 shadow-soft min-h-[200px]">
          {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <p className="whitespace-pre-wrap text-sm">{output || "Translation appears here…"}</p>}
        </div>
      </div>
      <button onClick={translate} disabled={loading} className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">Translate & Explain</button>
    </div>
  );
}
