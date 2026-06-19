"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { AsyncSectionSpinner } from "@/components/AsyncSection";
import type { AgentAccessTier } from "@/lib/bcc-agent-access";

type AccessResponse = {
  ok: boolean;
  tier?: AgentAccessTier;
  label?: string;
  balanceWei?: string;
};

export function BccAgentAccessBanner() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-access", address],
    queryFn: async () => {
      const res = await fetch(`/api/agents/access?address=${address}`);
      const json = (await res.json()) as AccessResponse;
      if (!res.ok || !json.ok) {
        throw new Error("agent_access_unavailable");
      }
      return json;
    },
    enabled: Boolean(address && isConnected),
    staleTime: 60_000,
  });

  if (!isConnected) return null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <AsyncSectionSpinner label="Loading BCC agent access…" />
      </div>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90">
        <p className="font-medium">BCC agent access</p>
        <p className="mt-1 text-xs opacity-90">
          Could not load your access tier right now. Paid agent APIs may still work with USDC.
        </p>
      </div>
    );
  }

  const tone =
    data.tier === "full"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      : data.tier === "paid_only"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
        : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${tone}`}>
      <p className="font-medium">BCC agent access</p>
      <p className="mt-1 text-xs opacity-90">{data.label}</p>
    </div>
  );
}
