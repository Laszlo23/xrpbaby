import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postPointsBalance, postRedeemPointsForBcc } from "@/lib/points-fns";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { pointsRedeemEnabled } from "@/lib/redemption-policy";
import { formatUnits } from "viem";

type RedeemReadiness = {
  enabled: boolean;
  ready: boolean;
  minPoolTvlUsd: number;
  combinedTvlUsd: number | null;
  percentToGate: number | null;
  pointsPerBccWei: string;
  rateConfigured?: boolean;
  maxRedeemPointsPerDay: number;
};

export function PointsRedeemSection({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const fetchBalance = useServerFn(postPointsBalance);
  const redeemFn = useServerFn(postRedeemPointsForBcc);

  const [balance, setBalance] = useState<number | null>(null);
  const [readiness, setReadiness] = useState<RedeemReadiness | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [quoteBccWei, setQuoteBccWei] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const loadState = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [balRes, marketRes] = await Promise.all([
        fetchBalance({ data: { address } }),
        fetch("/api/market/bcc").then((r) => r.json()),
      ]);
      if (balRes.ok) setBalance(balRes.balance);
      const redemption = marketRes?.redemption;
      if (redemption) {
        setReadiness({
          ...redemption,
          pointsPerBccWei: redemption.pointsPerBccWei ?? "0",
          maxRedeemPointsPerDay: 100_000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [address, fetchBalance]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useEffect(() => {
    if (!address || !pointsInput) {
      setQuoteBccWei(null);
      return;
    }
    const pts = Number(pointsInput);
    if (!Number.isInteger(pts) || pts <= 0) {
      setQuoteBccWei(null);
      return;
    }
    const t = window.setTimeout(() => {
      void fetch(
        `/api/points/redeem/quote?address=${encodeURIComponent(address)}&points=${pts}`,
      )
        .then((r) => r.json())
        .then((q) => {
          if (q.ok) setQuoteBccWei(q.bccWei);
        })
        .catch(() => setQuoteBccWei(null));
    }, 300);
    return () => window.clearTimeout(t);
  }, [address, pointsInput]);

  async function handleRedeem() {
    if (!address) return;
    const pts = Number(pointsInput);
    if (!Number.isInteger(pts) || pts <= 0) {
      toast.error("Enter a valid points amount.");
      return;
    }
    const signed = await signSiwe();
    if (!signed) return;

    setRedeeming(true);
    try {
      const result = await redeemFn({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          points: pts,
          idempotencyKey: crypto.randomUUID(),
        },
      });
      if (!result.ok) {
        toast.error(result.error ?? "Redemption failed");
        return;
      }
      setBalance(result.balance);
      setPointsInput("");
      toast.success(
        result.alreadyRedeemed
          ? "Already redeemed."
          : `Redeemed! BCC sent${result.txHash ? ` — tx ${result.txHash.slice(0, 10)}…` : ""}.`,
      );
    } finally {
      setRedeeming(false);
    }
  }

  if (!isConnected || !address) {
    return (
      <p className="text-sm text-zinc-400">
        Connect your wallet to redeem Culture Points for BCC.
      </p>
    );
  }

  const bccDisplay =
    quoteBccWei && quoteBccWei !== "0"
      ? formatUnits(BigInt(quoteBccWei), 18)
      : null;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-display text-2xl font-semibold text-white">
          {loading ? "…" : (balance ?? 0).toLocaleString()}
        </span>
        <span className="font-mono text-xs text-zinc-500">Culture Points</span>
      </div>

      {!pointsRedeemEnabled && (
        <p className="text-sm text-zinc-400">
          Points → BCC redemption is coming when pool liquidity meets program minimums.
          <Link to="/liquidity" className="ml-1 text-[#C5FF41] hover:underline">
            Track liquidity gate →
          </Link>
        </p>
      )}

      {pointsRedeemEnabled && readiness && !readiness.ready && (
        <p className="text-sm text-zinc-400">
          Redemption unlocks at ${readiness.minPoolTvlUsd.toLocaleString()} combined pool TVL
          {readiness.percentToGate != null ? ` (${readiness.percentToGate}% there)` : ""}.
          <Link to="/liquidity" className="ml-1 text-[#C5FF41] hover:underline">
            Liquidity hub →
          </Link>
        </p>
      )}

      {pointsRedeemEnabled && readiness?.ready && (
        <div className="space-y-3 rounded-xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 p-4">
          <p className="font-mono text-xs text-zinc-400">
            Loyalty credits — not securities. Redemption sends BCC from treasury; subject to daily
            caps and program rules.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mono-label text-zinc-500">Points to redeem</label>
              <Input
                type="number"
                min={1}
                max={balance ?? undefined}
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                placeholder="e.g. 100"
                className="mt-1 border-white/10 bg-black/40"
              />
            </div>
            <Button
              type="button"
              disabled={redeeming || signing || !pointsInput}
              onClick={() => void handleRedeem()}
              className="bg-[#C5FF41] text-black hover:bg-[#b8eb3a]"
            >
              {redeeming || signing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Redeem for BCC"
              )}
            </Button>
          </div>
          {bccDisplay && (
            <p className="font-mono text-xs text-zinc-400">
              ≈ {bccDisplay} BCC
            </p>
          )}
          <p className="font-mono text-[10px] text-zinc-600">
            Max {readiness.maxRedeemPointsPerDay.toLocaleString()} points per 24h. Pack purchases
            include a separate BCC bonus track.
          </p>
        </div>
      )}
    </div>
  );
}
