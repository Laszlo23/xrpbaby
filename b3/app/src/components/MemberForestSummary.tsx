import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

type Summary = {
  culturePoints: number;
  forestStage: string;
  supporterTier: string;
  grants: Record<string, number>;
};

type LoadState = "idle" | "loading" | "ready" | "db_down" | "error";

export function MemberForestSummary() {
  const { address, isConnected } = useAccount();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const load = useCallback(async () => {
    if (!address) return;
    setLoadState("loading");
    try {
      const res = await fetch(`/api/rewards/summary?address=${encodeURIComponent(address)}`);
      if (res.status === 503) {
        setSummary(null);
        setLoadState("db_down");
        return;
      }
      const data = (await res.json()) as { ok?: boolean } & Summary;
      if (data.ok) {
        setSummary(data);
        setLoadState("ready");
      } else {
        setSummary(null);
        setLoadState("error");
      }
    } catch {
      setSummary(null);
      setLoadState("error");
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isConnected || !address) {
    return (
      <div className="rounded-3xl bc-glass p-6 text-center sm:p-8">
        <p className="text-sm text-zinc-400">Sign in to see your growth and Culture Points.</p>
        <Link to="/join" className="mt-3 inline-block text-sm text-[#C5FF41] underline">
          Create your pass
        </Link>
      </div>
    );
  }

  if (loadState === "db_down") {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100 sm:p-8">
        <p className="font-medium">Database not reachable</p>
        <p className="mt-2 text-amber-200/80">
          From the repo root run{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">npm run db:start</code> then{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">npm run db:migrate</code>, or use{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">npm run dev:platform</code>.
        </p>
      </div>
    );
  }

  if (loadState === "loading" || !summary) {
    return (
      <div className="rounded-3xl bc-glass p-6 text-sm text-zinc-500 sm:p-8">
        {loadState === "error"
          ? "Could not load your profile. Refresh or try again."
          : "Loading your community stats…"}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#C5FF41]/25 bc-glass-strong p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Sprout className="h-8 w-8 text-[#C5FF41]" />
        <div>
          <p className="mono-label !text-zinc-500">Your growth</p>
          <p className="font-display text-lg font-semibold capitalize text-white">
            {summary.forestStage} · {summary.supporterTier}
          </p>
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-[#C5FF41]">
        {summary.culturePoints}{" "}
        <span className="text-sm font-normal text-zinc-400">Culture Points</span>
      </p>
    </div>
  );
}
