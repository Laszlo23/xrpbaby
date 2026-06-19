import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { postCompleteTaskWithSiwe } from "@/lib/points-fns";

export type ForestMemberLoadState = "idle" | "loading" | "ready" | "db_down" | "error";

export type ForestMemberSummary = {
  culturePoints: number;
  forestStage: string;
  supporterTier: string;
  checkInStreak?: number;
};

export function useForestMemberTasks() {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const completeTask = useServerFn(postCompleteTaskWithSiwe);

  const [summary, setSummary] = useState<ForestMemberSummary | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [claimingSlug, setClaimingSlug] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<ForestMemberLoadState>("idle");

  const refresh = useCallback(async () => {
    if (!address) {
      setSummary(null);
      setCompletedSlugs([]);
      setLoadState("idle");
      return;
    }
    setLoadState("loading");
    try {
      const [meRes, rewardsRes] = await Promise.all([
        fetch(`/api/member/me?address=${encodeURIComponent(address)}`),
        fetch(`/api/rewards/summary?address=${encodeURIComponent(address)}`),
      ]);

      if (rewardsRes.status === 503 || meRes.status === 503) {
        setSummary(null);
        setCompletedSlugs([]);
        setLoadState("db_down");
        return;
      }

      const meData = (await meRes.json()) as {
        ok?: boolean;
        member?: { completedSlugs?: string[] } | null;
      };
      const rewardsData = (await rewardsRes.json()) as {
        ok?: boolean;
        culturePoints?: number;
        forestStage?: string;
        supporterTier?: string;
      };

      if (rewardsData.ok) {
        setSummary({
          culturePoints: rewardsData.culturePoints ?? 0,
          forestStage: rewardsData.forestStage ?? "seedling",
          supporterTier: rewardsData.supporterTier ?? "guest",
        });
      } else {
        setSummary(null);
      }

      setCompletedSlugs(meData.member?.completedSlugs ?? []);
      setLoadState(rewardsData.ok ? "ready" : "error");
    } catch {
      setSummary(null);
      setCompletedSlugs([]);
      setLoadState("error");
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isDone = useCallback((slug: string) => completedSlugs.includes(slug), [completedSlugs]);

  const claimInline = useCallback(
    async (slug: string) => {
      setClaimingSlug(slug);
      try {
        const signed = await signSiwe();
        if (!signed) {
          toast.error(
            "Wallet signature required — connect on Base and approve the sign-in prompt.",
          );
          return;
        }
        const result = await completeTask({
          data: { message: signed.prepared, signature: signed.signature, taskSlug: slug },
        });
        if (!result.ok) {
          toast.error(result.error ?? "Could not claim quest");
          return;
        }
        toast.success(result.alreadyCompleted ? "Already completed" : "Quest claimed!");
        if (address && !result.alreadyCompleted) {
          void fetch("/api/memory/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: address, type: "quest_claim", questId: slug }),
          }).catch(() => undefined);
        }
        await refresh();
      } finally {
        setClaimingSlug(null);
      }
    },
    [completeTask, refresh, signSiwe],
  );

  return {
    address,
    isConnected,
    summary,
    completedSlugs,
    claimingSlug,
    signing,
    loadState,
    refresh,
    claimInline,
    isDone,
  };
}
