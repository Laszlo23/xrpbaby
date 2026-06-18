"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, type Address } from "viem";

import { BCC_ADDRESS } from "@bc/bcc-kit";

import { Button } from "@/components/ui/button";
import { GRANT_AGENT_BCC_PRICE, GRANT_AGENT_BCC_PRICE_WEI } from "@/lib/grant-agent-config";
import { TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";

type GrantResponse = {
  ok: boolean;
  report?: string;
  error?: string;
  priceBcc?: number;
};

export function GrantPanel() {
  const { address, isConnected } = useAccount();
  const [brief, setBrief] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "paying" | "running">("idle");
  const submittedTxRef = useRef<string | null>(null);

  const { writeContractAsync, data: txHash, isPending: isWritePending } = useWriteContract();
  const { isLoading: waitingTx, isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const submitGrant = useCallback(
    async (paymentTxHash: `0x${string}`) => {
      if (!address) return;
      setStep("running");
      setError(null);
      setReport(null);

      try {
        const res = await fetch("/api/agents/grant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief: brief.trim(),
            txHash: paymentTxHash,
            walletAddress: address,
          }),
        });
        const data = (await res.json()) as GrantResponse;
        if (!data.ok || !data.report) {
          setError(data.error ?? "Grant request failed.");
          return;
        }
        setReport(data.report);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Grant request failed.");
      } finally {
        setStep("idle");
      }
    },
    [address, brief],
  );

  useEffect(() => {
    if (step === "paying" && txConfirmed && txHash && submittedTxRef.current !== txHash) {
      submittedTxRef.current = txHash;
      void submitGrant(txHash);
    }
  }, [step, txConfirmed, txHash, submitGrant]);

  async function handlePayAndRun() {
    const text = brief.trim();
    if (!text || !address) return;
    setError(null);
    setStep("paying");

    try {
      await writeContractAsync({
        address: BCC_ADDRESS as Address,
        abi: erc20Abi,
        functionName: "transfer",
        args: [TREASURY_SAFE_ADDRESS as Address, GRANT_AGENT_BCC_PRICE_WEI],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "BCC payment failed.");
      setStep("idle");
    }
  }

  const busy = step !== "idle" || waitingTx || isWritePending;

  return (
    <section
      id="grant-agent"
      className="space-y-4 rounded-3xl border border-amber-500/25 bg-amber-950/20 p-6 md:p-8"
    >
      <div className="flex items-start gap-3">
        <FileText className="mt-1 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
        <div>
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Grant Agent — MVP
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Describe your project. Pay{" "}
            <span className="font-mono text-amber-200/90">{GRANT_AGENT_BCC_PRICE} BCC</span> to
            treasury — the agent finds matching grants and drafts your application outline.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Org grant verification lives at{" "}
            <a href="/grant-proof" className="text-zinc-400 underline hover:text-white">
              /grant-proof
            </a>{" "}
            (separate from this user agent).
          </p>
        </div>
      </div>

      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={4}
        placeholder="Project name, mission, who you serve, what funding you need, and timeline…"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600"
        disabled={busy}
      />

      {!isConnected ? (
        <p className="text-sm text-zinc-500">Connect wallet to pay with BCC.</p>
      ) : (
        <Button
          type="button"
          disabled={busy || brief.trim().length < 20}
          onClick={() => void handlePayAndRun()}
          className="rounded-full bg-amber-400 text-black hover:bg-amber-300"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {step === "paying" || waitingTx ? "Confirm BCC payment…" : "Drafting…"}
            </>
          ) : (
            `Pay ${GRANT_AGENT_BCC_PRICE} BCC & run Grant Agent`
          )}
        </Button>
      )}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {report ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="mono-label">GRANT REPORT</p>
          <div className="prose prose-invert mt-3 max-w-none text-sm whitespace-pre-wrap text-zinc-300">
            {report}
          </div>
        </div>
      ) : null}
    </section>
  );
}
