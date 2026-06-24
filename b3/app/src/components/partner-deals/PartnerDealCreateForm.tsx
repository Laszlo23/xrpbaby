"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog, type Hex } from "viem";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getServiceDealEscrowAddress,
  getServiceDealUsdcAddress,
  serviceDealEscrowAbi,
  erc20ApproveAbi,
  serviceDealEscrowConfigured,
} from "@/lib/partner-deals-config";
import type { ServiceDealMetadata } from "@/lib/partner-deals-types";

const emptyDeliverable = {
  id: "",
  description: "",
  weightBps: 5000,
  kpis: [{ metric: "telegram_members_gained", target: 100, source: "telegram_export" }],
};

export function PartnerDealCreateForm() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [title, setTitle] = useState("Telegram channel promotion");
  const [provider, setProvider] = useState("");
  const [amountUsdc, setAmountUsdc] = useState("100");
  const [deliverBy, setDeliverBy] = useState("");
  const [deliverableDesc, setDeliverableDesc] = useState("Pinned post in partner Telegram channel");
  const [kpiTarget, setKpiTarget] = useState(200);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dealId, setDealId] = useState<string | null>(null);
  const [onChainDealId, setOnChainDealId] = useState<string | null>(null);

  const escrow = getServiceDealEscrowAddress();
  const usdc = getServiceDealUsdcAddress();

  async function handleCreate() {
    if (!address || !escrow) return;
    setBusy(true);
    setError(null);

    const amountAtomic = BigInt(Math.round(Number(amountUsdc) * 1_000_000)).toString();
    const deliverableId = "primary-deliverable";
    const metadata: ServiceDealMetadata = {
      version: 1,
      title,
      provider: provider.toLowerCase(),
      payer: address.toLowerCase(),
      payment: { token: "USDC", chainId: 8453, amount: amountAtomic },
      deliverBy: new Date(deliverBy).toISOString(),
      deliverables: [
        {
          ...emptyDeliverable,
          id: deliverableId,
          description: deliverableDesc,
          weightBps: 10_000,
          kpis: [
            { metric: "telegram_members_gained", target: kpiTarget, source: "telegram_export" },
          ],
        },
      ],
      evidenceRequirements: ["telegram_analytics_export", "post_screenshot"],
    };

    try {
      const res = await fetch("/api/partner-deals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        dealId?: string;
        metadataHash?: string;
        error?: string;
      };
      if (!data.ok || !data.dealId) {
        setError(data.error ?? "create_failed");
        return;
      }
      setDealId(data.dealId);

      const deliverByUnix = BigInt(Math.floor(new Date(deliverBy).getTime() / 1000));
      const metadataHash = data.metadataHash as Hex;
      if (!metadataHash) {
        setError("missing_metadata_hash");
        return;
      }

      const createHash = await writeContractAsync({
        address: escrow,
        abi: serviceDealEscrowAbi,
        functionName: "createDeal",
        args: [
          provider.toLowerCase() as `0x${string}`,
          BigInt(amountAtomic),
          metadataHash,
          deliverByUnix,
          0n,
        ],
      });

      const { createPublicClient, http } = await import("viem");
      const { base } = await import("viem/chains");
      const client = createPublicClient({ chain: base, transport: http() });
      const txReceipt = await client.waitForTransactionReceipt({ hash: createHash });

      let chainDealId: string | null = null;
      for (const log of txReceipt.logs) {
        if (log.address.toLowerCase() !== escrow.toLowerCase()) continue;
        try {
          const parsed = decodeEventLog({
            abi: serviceDealEscrowAbi,
            eventName: "DealCreated",
            data: log.data,
            topics: log.topics,
          });
          chainDealId = parsed.args.dealId.toString();
          break;
        } catch {
          // skip
        }
      }
      if (!chainDealId) {
        setError("create_tx_ok_but_deal_id_not_found");
        return;
      }
      setOnChainDealId(chainDealId);

      await writeContractAsync({
        address: usdc,
        abi: erc20ApproveAbi,
        functionName: "approve",
        args: [escrow, BigInt(amountAtomic)],
      });

      const fundHash = await writeContractAsync({
        address: escrow,
        abi: serviceDealEscrowAbi,
        functionName: "fund",
        args: [BigInt(chainDealId)],
      });

      await fetch(`/api/partner-deals/${data.dealId}?action=fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onChainDealId: chainDealId,
          fundTxHash: fundHash,
          createTxHash: createHash,
        }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "tx_failed");
    } finally {
      setBusy(false);
    }
  }

  if (!serviceDealEscrowConfigured()) {
    return (
      <p className="text-sm text-amber-300/90">
        Escrow not configured. Set <code className="text-xs">VITE_SERVICE_DEAL_ESCROW_ADDRESS</code>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
      <h2 className="font-heading text-lg text-white">New partner service deal</h2>
      <p className="text-sm text-zinc-400">
        Lock USDC in escrow. Service terms are hashed on-chain; AI proposes payout; council can veto
        within 72h.
      </p>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Title</span>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Provider wallet</span>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-sm text-white"
          placeholder="0x..."
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Amount (USDC)</span>
          <input
            type="number"
            min="1"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
            value={amountUsdc}
            onChange={(e) => setAmountUsdc(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Deliver by</span>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
            value={deliverBy}
            onChange={(e) => setDeliverBy(e.target.value)}
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Deliverable</span>
        <textarea
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
          rows={2}
          value={deliverableDesc}
          onChange={(e) => setDeliverableDesc(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          KPI target (members gained)
        </span>
        <input
          type="number"
          min="1"
          className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
          value={kpiTarget}
          onChange={(e) => setKpiTarget(Number(e.target.value))}
        />
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {dealId && onChainDealId ? (
        <p className="text-sm text-emerald-400">
          Deal funded on-chain #{onChainDealId}.{" "}
          <Link to="/dao/partner-deals/$id" params={{ id: dealId }} className="underline">
            View deal
          </Link>
        </p>
      ) : null}

      <Button
        type="button"
        disabled={!isConnected || busy || isPending || !provider || !deliverBy}
        onClick={() => void handleCreate()}
      >
        {busy || isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create & fund escrow
      </Button>
    </div>
  );
}
