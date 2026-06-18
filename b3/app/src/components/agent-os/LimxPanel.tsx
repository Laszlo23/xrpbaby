"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Wallet } from "lucide-react";
import { useFetchWithPayment } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import {
  LIMX_AGENT_PUBLIC_URL,
  LIMX_AGENT_WALLET_ADDRESS,
  limxAgentWalletAddress,
} from "@/lib/limx-agent-config";
import { thirdwebClient } from "@/lib/thirdweb-client";

type LimxResponse = {
  ok: boolean;
  agent?: string;
  wallet?: string;
  query?: string;
  brief?: string;
  error?: string;
  source?: string;
  generatedAt?: string;
};

type LimxPanelProps = {
  limxPrice: string;
};

const DEFAULT_QUERY =
  "What Base ecosystem grants, partnerships, and sponsors fit Building Culture — an AI + community identity product?";

function LimxPanelInner({ limxPrice }: LimxPanelProps) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [brief, setBrief] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const client = thirdwebClient!;
  const { fetchWithPayment, isPending } = useFetchWithPayment(client, {
    maxValue: 2_000_000n,
    signInRequiredModal: {
      title: "Connect wallet",
      description: `Pay ${limxPrice} in USDC on Base. Settlement goes to the Limx agent wallet.`,
      buttonLabel: "Connect wallet",
    },
  });

  const wallet = limxAgentWalletAddress();

  async function handleAsk() {
    const q = query.trim();
    if (!q) return;
    setLastError(null);
    setBrief(null);

    try {
      const url = `/api/agents/limx?q=${encodeURIComponent(q)}`;
      const data = (await fetchWithPayment(url)) as LimxResponse;
      if (!data.ok || !data.brief) {
        setLastError(data.error ?? "Opportunity brief failed.");
        return;
      }
      setBrief(data.brief);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Payment or brief request failed.");
    }
  }

  return (
    <section
      id="limx-agent"
      className="space-y-4 rounded-3xl border border-violet-500/25 bg-violet-950/20 p-6 md:p-8"
    >
      <div className="flex items-start gap-3">
        <Wallet className="mt-1 h-5 w-5 shrink-0 text-violet-400" aria-hidden />
        <div>
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Limx Revenue Agent — live
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Grants, partnerships, sponsors, and growth opportunities for Building Culture. Pay{" "}
            <span className="font-mono text-violet-200/90">{limxPrice}</span> in USDC on Base per
            brief via x402. Settlement goes directly to the non-custodial Limx wallet.
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            {wallet.slice(0, 10)}…{wallet.slice(-8)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-full" asChild>
          <a href={LIMX_AGENT_PUBLIC_URL} target="_blank" rel="noreferrer noopener">
            Pay Limx directly <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </Button>
        <Button variant="ghost" className="rounded-full text-zinc-400" asChild>
          <a
            href={`https://basescan.org/address/${LIMX_AGENT_WALLET_ADDRESS}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            View on BaseScan
          </a>
        </Button>
      </div>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="e.g. Which sponsors and grant programs fit a Web3 + AI community platform on Base?"
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/40 focus:outline-none"
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
            `Get opportunity brief (${limxPrice} USDC)`
          )}
        </Button>
        <p className="text-xs text-zinc-500">Research only — outbound outreach stays human-approved.</p>
      </div>

      {lastError ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {lastError}
        </p>
      ) : null}

      {brief ? (
        <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-5">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Opportunity brief</p>
          <div className="prose prose-invert prose-sm mt-3 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {brief}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function LimxPanel(props: LimxPanelProps) {
  if (!thirdwebClient) {
    return (
      <section
        id="limx-agent"
        className="space-y-4 rounded-3xl border border-violet-500/25 bg-violet-950/20 p-6 md:p-8"
      >
        <h2 className="font-heading text-xl font-semibold text-white">Limx Revenue Agent — live</h2>
        <p className="text-sm text-zinc-400">
          Paid opportunity briefs via x402 require wallet configuration (
          <span className="font-mono">VITE_THIRDWEB_CLIENT_ID</span>). Agents can call{" "}
          <span className="font-mono text-zinc-300">GET /api/agents/limx?q=...</span> with x402
          payment. Public wallet:{" "}
          <a
            href={LIMX_AGENT_PUBLIC_URL}
            className="text-violet-300 hover:text-white"
            target="_blank"
            rel="noreferrer noopener"
          >
            wallet.blockchain0x.com/a/limx
          </a>
        </p>
      </section>
    );
  }
  return <LimxPanelInner {...props} />;
}
