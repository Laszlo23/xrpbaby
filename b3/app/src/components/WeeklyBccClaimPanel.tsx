import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Coins, Loader2, Sprout, Zap } from "lucide-react";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { postClaimWeeklyBcc, postWeeklyClaimQuote } from "@/lib/points-fns";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { weeklyClaimEnabled } from "@/lib/weekly-claim-policy";

type Quote = {
  ok: boolean;
  enabled: boolean;
  ready: boolean;
  balance: number;
  boostedBccWei: string;
  stakingBoostLabel: string;
  canClaim: boolean;
  nextClaimAt: string | null;
  onPayoutWhitelist: boolean;
  cooldownMs: number;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ready now";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m`;
}

export function WeeklyBccClaimPanel({
  compact = false,
  onBalanceChange,
}: {
  compact?: boolean;
  onBalanceChange?: (balance: number) => void;
}) {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const fetchQuote = useServerFn(postWeeklyClaimQuote);
  const claimWeekly = useServerFn(postClaimWeeklyBcc);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [countdownMs, setCountdownMs] = useState(0);
  const [displayBalance, setDisplayBalance] = useState<number | null>(null);
  const prevBalance = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetchQuote({ data: { address } });
      if (r.ok) {
        setQuote(r as Quote);
        setDisplayBalance(r.balance);
        onBalanceChange?.(r.balance);
        if (prevBalance.current !== null && r.balance > prevBalance.current) {
          toast.success(`+${r.balance - prevBalance.current} Culture Points`, {
            description: "Nice — keep stacking for your weekly BCC claim.",
          });
        }
        prevBalance.current = r.balance;
        if (r.nextClaimAt) {
          setCountdownMs(Math.max(0, new Date(r.nextClaimAt).getTime() - Date.now()));
        } else {
          setCountdownMs(0);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [address, fetchQuote, onBalanceChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!quote?.nextClaimAt || quote.canClaim) return;
    const tick = () => {
      const ms = Math.max(0, new Date(quote.nextClaimAt!).getTime() - Date.now());
      setCountdownMs(ms);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [quote?.nextClaimAt, quote?.canClaim]);

  async function handleClaim() {
    if (!address || !quote?.canClaim) return;
    const signed = await signSiwe();
    if (!signed) return;

    setClaiming(true);
    try {
      const result = await claimWeekly({
        data: {
          message: signed.prepared,
          signature: signed.signature,
        },
      });
      if (!result.ok) {
        toast.error(
          result.error === "not_on_payout_whitelist"
            ? "Weekly BCC payouts are limited to approved wallets during launch."
            : (result.error ?? "Weekly claim failed"),
        );
        return;
      }
      if (result.alreadyClaimed) {
        toast.message("Already claimed this week.");
      } else {
        const bcc =
          result.bccWei && result.bccWei !== "0"
            ? formatUnits(BigInt(result.bccWei), 18)
            : null;
        toast.success(
          bcc
            ? `Weekly BCC claimed — ~${bcc} BCC${result.stakingBoostLabel ? ` (${result.stakingBoostLabel} boost)` : ""}`
            : "Weekly claim recorded!",
        );
      }
      await refresh();
    } finally {
      setClaiming(false);
    }
  }

  if (!weeklyClaimEnabled) return null;

  if (!isConnected || !address) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
        <p className="text-sm text-zinc-400">Connect wallet to track weekly BCC claims.</p>
        <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
          <Link to="/join">Create your pass</Link>
        </Button>
      </div>
    );
  }

  const bccDisplay =
    quote?.boostedBccWei && quote.boostedBccWei !== "0"
      ? formatUnits(BigInt(quote.boostedBccWei), 18)
      : null;

  return (
    <div
      className={
        compact
          ? "space-y-3 rounded-xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#C5FF41]/10 to-transparent p-4"
          : "space-y-4 rounded-2xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#C5FF41]/10 to-transparent p-5"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#C5FF41]">
            Weekly BCC claim
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-white tabular-nums transition-all duration-500">
              {loading ? "…" : (displayBalance ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500">Culture Points</span>
          </p>
        </div>
        {quote?.stakingBoostLabel && quote.stakingBoostLabel !== "1.00×" ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
            <Sprout className="h-3 w-3" aria-hidden />
            {quote.stakingBoostLabel} stake boost
          </span>
        ) : (
          <Link
            to="/roots"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-[#C5FF41]"
          >
            <Sprout className="h-3 w-3" aria-hidden />
            Stake to boost
          </Link>
        )}
      </div>

      {bccDisplay && Number(bccDisplay) > 0 ? (
        <p className="flex items-center gap-2 text-sm text-zinc-300">
          <Coins className="h-4 w-4 text-[#C5FF41]" aria-hidden />
          ≈ {bccDisplay} BCC this week
        </p>
      ) : (
        <p className="text-xs text-zinc-500">
          Complete quests to stack Culture Points — claim converts to BCC once per week.
        </p>
      )}

      {quote?.canClaim && quote.balance > 0 ? (
        <Button
          type="button"
          disabled={claiming || signing || !quote.ready}
          onClick={() => void handleClaim()}
          className="w-full rounded-full bg-[#C5FF41] font-semibold text-black hover:bg-[#b8eb3a]"
        >
          {claiming || signing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" aria-hidden />
              Claim weekly BCC
            </>
          )}
        </Button>
      ) : quote?.nextClaimAt && countdownMs > 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/30 py-2.5 text-sm text-zinc-400">
          <Clock className="h-4 w-4" aria-hidden />
          Next claim in {formatCountdown(countdownMs)}
        </div>
      ) : quote?.balance === 0 ? (
        <Button asChild variant="outline" className="w-full rounded-full border-white/15">
          <Link to="/forest/quests">Earn Culture Points</Link>
        </Button>
      ) : quote?.balance > 0 && quote.onPayoutWhitelist === false ? (
        <p className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-200/90">
          Weekly BCC payouts are limited to approved wallets during launch.
        </p>
      ) : null}

      <p className="font-mono text-[10px] text-zinc-600">
        One on-chain BCC payout per week · Staking on /roots boosts your conversion · Separate from
        pool rewards
      </p>
    </div>
  );
}
