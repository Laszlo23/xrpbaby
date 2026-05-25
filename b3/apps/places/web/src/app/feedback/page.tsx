"use client";

import Link from "next/link";
import { useState } from "react";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message.trim(),
        email: email.trim() || undefined,
        category: "general",
      }),
    });
    const j = (await res.json()) as { error?: string; ok?: boolean };
    if (res.ok && j.ok) {
      setStatus("ok");
      setMessage("");
      setEmail("");
    } else {
      setStatus("err");
      setErr(j.error ?? `Error ${res.status}`);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Feedback</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Suggestions</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Share product feedback or ideas. Signing in helps us correlate with your wallet session; it is optional for
          the message itself. Not support for legal or investment questions — see{" "}
          <Link href="/legal" className="text-brand hover:underline">
            Legal
          </Link>
          .
        </p>
      </header>

      <form onSubmit={(e) => void submit(e)} className="glass-card space-y-4 p-6">
        <label className="block text-sm">
          <span className="text-zinc-500">Message (min. 10 characters)</span>
          <textarea
            required
            minLength={10}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
            placeholder="What would make this hub clearer or more useful?"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Contact email (optional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-gradient-to-r from-gold-700 to-gold-600 px-5 py-2 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send feedback"}
        </button>
        {status === "ok" && <p className="text-sm text-emerald-400">Thanks — your note was saved.</p>}
        {status === "err" && err && <p className="text-sm text-red-400">{err}</p>}
      </form>

      <Link href="/community" className="text-sm text-brand hover:underline">
        ← Community
      </Link>
    </div>
  );
}
