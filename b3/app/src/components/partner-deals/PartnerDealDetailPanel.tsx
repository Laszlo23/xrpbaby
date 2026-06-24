"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { keccak256, toBytes, type Hex } from "viem";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServiceDealEscrowAddress, serviceDealEscrowAbi } from "@/lib/partner-deals-config";

type DealRow = {
  id: string;
  title: string;
  status: string;
  metadataHash: string;
  onChainDealId: string | null;
  amountUsdc: string;
  payerWallet: string;
  providerWallet: string;
  deliverBy: string;
  metadata: Record<string, unknown>;
  evidence: { evidenceHash: string; payload: unknown }[];
  rulings: {
    payoutBps: number;
    reasoning: unknown;
    councilOverride: boolean;
    aiConfidence: number | null;
    rulingHash: string;
  }[];
};

function canonicalJsonString(value: unknown): string {
  function sortValue(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(sortValue);
    if (v !== null && typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(obj).sort()) sorted[key] = sortValue(obj[key]);
      return sorted;
    }
    return v;
  }
  return JSON.stringify(sortValue(value));
}

export function PartnerDealDetailPanel({ dealId }: { dealId: string }) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [deal, setDeal] = useState<DealRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [overrideBps, setOverrideBps] = useState(5000);
  const [overrideReason, setOverrideReason] = useState("");
  const [metricValue, setMetricValue] = useState(0);
  const [artifactUri, setArtifactUri] = useState("");

  const escrow = getServiceDealEscrowAddress();

  async function reload() {
    const res = await fetch(`/api/partner-deals/${dealId}`);
    const data = (await res.json()) as { ok: boolean; deal?: DealRow };
    if (data.ok && data.deal) setDeal(data.deal);
  }

  useEffect(() => {
    void reload();
  }, [dealId]);

  async function runEvaluate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/partner-deals/${dealId}/evaluate`, { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) setError(data.error ?? "evaluate_failed");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function submitEvidence() {
    if (!address || !deal?.onChainDealId || !escrow) return;
    setBusy(true);
    setError(null);

    const evidence = {
      version: 1 as const,
      dealId: Number(deal.onChainDealId),
      dealMetadataHash: deal.metadataHash,
      submittedAt: new Date().toISOString(),
      submittedBy: address.toLowerCase(),
      artifacts: artifactUri
        ? [{ type: "link", uri: artifactUri }]
        : [{ type: "note", uri: "inline", note: "metrics only" }],
      metrics: { telegram_members_gained: metricValue },
    };

    const evidenceHash = keccak256(toBytes(canonicalJsonString(evidence))) as Hex;

    try {
      await writeContractAsync({
        address: escrow,
        abi: serviceDealEscrowAbi,
        functionName: "submitEvidence",
        args: [BigInt(deal.onChainDealId), evidenceHash],
      });

      const res = await fetch(`/api/partner-deals/${dealId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          evidence,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) setError(data.error ?? "evidence_failed");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "evidence_tx_failed");
    } finally {
      setBusy(false);
    }
  }

  async function councilOverride() {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/partner-deals/${dealId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          payoutBps: overrideBps,
          reasoning: overrideReason || "Council override",
          calldataOnly: true,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        overrideCalldata?: Hex;
        escrowAddress?: `0x${string}`;
        rulingHash?: Hex;
      };
      if (!data.ok || !data.escrowAddress || !data.rulingHash) {
        setError(data.error ?? "override_failed");
        return;
      }

      await writeContractAsync({
        address: data.escrowAddress,
        abi: serviceDealEscrowAbi,
        functionName: "overrideRuling",
        args: [BigInt(deal!.onChainDealId!), overrideBps, data.rulingHash],
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "override_tx_failed");
    } finally {
      setBusy(false);
    }
  }

  if (!deal) {
    return <p className="text-sm text-zinc-500">Loading deal…</p>;
  }

  const ruling = deal.rulings[0];
  const isProvider = address?.toLowerCase() === deal.providerWallet.toLowerCase();
  const amountHuman = (Number(deal.amountUsdc) / 1_000_000).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-black/40 p-6">
        <h1 className="font-heading text-xl text-white">{deal.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Status: <span className="text-zinc-200">{deal.status}</span> · {amountHuman} USDC ·
          on-chain #{deal.onChainDealId ?? "—"}
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-500 break-all">{deal.metadataHash}</p>
      </div>

      {isProvider && deal.status === "funded" ? (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-3">
          <h2 className="text-sm font-medium text-white">Submit evidence (provider)</h2>
          <input
            type="number"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
            placeholder="telegram_members_gained"
            value={metricValue}
            onChange={(e) => setMetricValue(Number(e.target.value))}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
            placeholder="Artifact URL (optional)"
            value={artifactUri}
            onChange={(e) => setArtifactUri(e.target.value)}
          />
          <Button
            type="button"
            disabled={!isConnected || busy || isPending}
            onClick={() => void submitEvidence()}
          >
            Submit evidence on-chain
          </Button>
        </div>
      ) : null}

      {deal.status === "evidence_submitted" ? (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6">
          <Button type="button" disabled={busy} onClick={() => void runEvaluate()}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run AI evaluation
          </Button>
        </div>
      ) : null}

      {ruling ? (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 space-y-2">
          <h2 className="text-sm font-medium text-white">Latest ruling</h2>
          <p className="text-sm text-zinc-300">
            Payout: {(ruling.payoutBps / 100).toFixed(2)}%
            {ruling.aiConfidence != null
              ? ` · AI confidence ${(ruling.aiConfidence * 100).toFixed(0)}%`
              : ""}
            {ruling.councilOverride ? " · council override" : ""}
          </p>
          <pre className="overflow-x-auto rounded-lg bg-black/60 p-3 text-xs text-zinc-400">
            {JSON.stringify(ruling.reasoning, null, 2)}
          </pre>
        </div>
      ) : null}

      {ruling && (deal.status === "ruled" || deal.status === "overridden") ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-3">
          <h2 className="text-sm font-medium text-amber-100">Council veto / override</h2>
          <input
            type="number"
            min={0}
            max={10000}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
            value={overrideBps}
            onChange={(e) => setOverrideBps(Number(e.target.value))}
          />
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
            rows={2}
            placeholder="Override reasoning"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />
          <Button
            type="button"
            disabled={!isConnected || busy || isPending}
            onClick={() => void councilOverride()}
          >
            Override ruling on-chain
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
