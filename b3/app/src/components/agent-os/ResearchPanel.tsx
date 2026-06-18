"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useFetchWithPayment } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { thirdwebClient } from "@/lib/thirdweb-client";

type ResearchResponse = {
  ok: boolean;
  agent?: string;
  query?: string;
  brief?: string;
  error?: string;
  source?: string;
  generatedAt?: string;
};

type ResearchPanelProps = {
  researchPrice: string;
};

function ResearchPanelInner({ researchPrice }: ResearchPanelProps) {
  const [query, setQuery] = useState("");
  const [brief, setBrief] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const client = thirdwebClient!;
  const { fetchWithPayment, isPending } = useFetchWithPayment(client, {
    maxValue: 500_000n,
    signInRequiredModal: {
      title: "Connect wallet",
      description: `Pay ${researchPrice} in USDC on Base per research query.`,
      buttonLabel: "Connect wallet",
    },
  });

  async function handleAsk() {
    const q = query.trim();
    if (!q) return;
    setLastError(null);
    setBrief(null);

    try {
      const url = `/api/agents/research?q=${encodeURIComponent(q)}`;
      const data = (await fetchWithPayment(url)) as ResearchResponse;
      if (!data.ok || !data.brief) {
        setLastError(data.error ?? "Research request failed.");
        return;
      }
      setBrief(data.brief);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Payment or research failed.");
    }
  }

  return (
    <section
      id="research-agent"
      className="space-y-4 rounded-3xl border border-emerald-500/25 bg-emerald-950/20 p-6 md:p-8"
    >
      <div className="flex items-start gap-3">
        <Search className="mt-1 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <div>
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Research Agent — live
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Ask about Web3, AI, grants, or ecosystem strategy. Pay{" "}
            <span className="font-mono text-emerald-200/90">{researchPrice}</span> in USDC on Base
            per query via x402. No outbound actions — research only.
          </p>
        </div>
      </div>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="e.g. What Base ecosystem grants fit an AI + community product in 2026?"
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          className="rounded-full"
          disabled={isPending || !query.trim()}
          onClick={() => void handleAsk()}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Paying & researching…
            </>
          ) : (
            `Ask (${researchPrice} USDC)`
          )}
        </Button>
        <p className="text-xs text-zinc-500">Connect wallet on Base. Human approval not required.</p>
      </div>

      {lastError ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {lastError}
        </p>
      ) : null}

      {brief ? (
        <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Research brief</p>
          <div className="prose prose-invert prose-sm mt-3 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {brief}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ResearchPanel(props: ResearchPanelProps) {
  if (!thirdwebClient) {
    return (
      <section
        id="research-agent"
        className="space-y-4 rounded-3xl border border-emerald-500/25 bg-emerald-950/20 p-6 md:p-8"
      >
        <h2 className="font-heading text-xl font-semibold text-white">Research Agent — live</h2>
        <p className="text-sm text-zinc-400">
          Paid research via x402 requires wallet configuration (
          <span className="font-mono">VITE_THIRDWEB_CLIENT_ID</span>). API still works for agents
          at{" "}
          <span className="font-mono text-zinc-300">GET /api/agents/research?q=...</span>
        </p>
      </section>
    );
  }
  return <ResearchPanelInner {...props} />;
}
