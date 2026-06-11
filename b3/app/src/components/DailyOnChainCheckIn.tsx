import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { dailyCheckInAbi } from "@/lib/abis/daily-checkin";
import { getDefaultChain } from "@/lib/chains";
import { getDailyCheckInAddress, utcCheckInDayIndex } from "@/lib/daily-checkin";
import { postCompleteDailyChainCheckIn, postPointsBalance } from "@/lib/points-fns";
import { claimDaily } from "@/lib/playerProgress";

type Props = {
  signSiwe: () => Promise<{ prepared: string; signature: string } | undefined>;
  signingDisabled: boolean;
  onBalance?: (balance: number) => void;
  /** Profile XP (+50 / vault bonus) after a successful daily check-in. */
  onLocalDailyClaim?: () => void;
  /** When set, syncs local `claimDaily` with genesis vault bonus after chain tx. */
  genesisVaultBonusXp?: number;
  compact?: boolean;
};

export function DailyOnChainCheckIn({
  signSiwe,
  signingDisabled,
  onBalance,
  onLocalDailyClaim,
  genesisVaultBonusXp = 0,
  compact = false,
}: Props) {
  const contractAddress = getDailyCheckInAddress();
  const wantChain = getDefaultChain();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const completeDaily = useServerFn(postCompleteDailyChainCheckIn);
  const fetchBalance = useServerFn(postPointsBalance);
  const { writeContractAsync, isPending: txPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [claiming, setClaiming] = useState(false);
  const [ledgerDoneToday, setLedgerDoneToday] = useState(false);
  const processedHash = useRef<string | null>(null);

  const todayIndex = utcCheckInDayIndex();

  const { data: lastDay, refetch: refetchLastDay } = useReadContract({
    address: contractAddress,
    abi: dailyCheckInAbi,
    functionName: "lastCheckInDay",
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address },
  });

  const onChainDoneToday = lastDay !== undefined && lastDay === todayIndex;
  const siweOnlyMode = !contractAddress;

  const refreshLedgerStatus = useCallback(async () => {
    if (!address) return;
    try {
      const r = await fetchBalance({ data: { address } });
      if (r.ok) {
        setLedgerDoneToday(r.dailyCheckInToday === true);
        if (typeof r.balance === "number") onBalance?.(r.balance);
      }
    } catch {
      /* best-effort */
    }
  }, [address, fetchBalance, onBalance]);

  useEffect(() => {
    void refreshLedgerStatus();
  }, [refreshLedgerStatus]);

  async function recordDaily(opts?: { txHash?: `0x${string}`; chainId?: number }) {
    setClaiming(true);
    try {
      const signed = await signSiwe();
      if (!signed) return false;

      const res = await completeDaily({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          ...(opts?.txHash ? { txHash: opts.txHash, chainId: opts.chainId } : {}),
        },
      });

      if (!res.ok) {
        toast.error(res.error ?? "Could not record daily check-in");
        return false;
      }

      if (address && onLocalDailyClaim) {
        const local = claimDaily(address, { genesisVaultBonusXp });
        if (local.ok) onLocalDailyClaim();
      }

      if (res.alreadyCompleted) {
        toast.message("Daily check-in verified · points already credited today");
      } else {
        const bonusText =
          res.bonusGranted && (res.bonusPoints ?? 0) > 0
            ? ` +${res.bonusPoints} signature bonus`
            : "";
        toast.success(`Daily check-in saved (+${20}${bonusText} ledger pts)`);
      }

      onBalance?.(res.balance);
      setLedgerDoneToday(true);
      void refetchLastDay();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
      return false;
    } finally {
      setClaiming(false);
    }
  }

  useEffect(() => {
    if (!isSuccess || !hash || processedHash.current === hash) return;
    processedHash.current = hash;
    void (async () => {
      const ok = await recordDaily({ txHash: hash, chainId: wantChain.id });
      if (!ok) processedHash.current = null;
      setHash(undefined);
    })();
  }, [hash, isSuccess, wantChain.id]);

  async function runOnChainCheckIn() {
    if (!contractAddress) return;
    try {
      if (chainId !== wantChain.id) {
        await switchChainAsync({ chainId: wantChain.id });
      }
      const h = await writeContractAsync({
        address: contractAddress,
        abi: dailyCheckInAbi,
        functionName: "checkIn",
      });
      setHash(h);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      if (/AlreadyCheckedIn|already checked/i.test(msg)) {
        toast.message("Already checked in on-chain today (UTC day)");
        void refetchLastDay();
        return;
      }
      toast.error(msg);
    }
  }

  async function runSiweDaily() {
    await recordDaily();
  }

  if (!isConnected) return null;

  const busy = txPending || confirming || claiming || signingDisabled;
  const doneToday = ledgerDoneToday || (contractAddress ? onChainDoneToday : false);

  const shellClass = compact
    ? "space-y-2"
    : "rounded-2xl border border-white/[0.06] bg-black/20 p-4 space-y-2";

  return (
    <div className={shellClass}>
      <p
        className={
          compact ? "text-[11px] font-semibold text-emerald-100/95" : "font-medium text-white"
        }
      >
        Daily check-in {siweOnlyMode ? "(sign to earn)" : `on ${wantChain.name}`}
      </p>
      <p className="text-xs text-zinc-500">
        {siweOnlyMode ? (
          <>
            Sign once per UTC day to credit <strong className="text-zinc-300">+20 pts</strong> and a{" "}
            <strong className="text-zinc-300">+7 signature bonus</strong> on the server ledger —
            no gas required.
          </>
        ) : (
          <>
            One <span className="font-mono">checkIn()</span> tx per UTC day on-chain, then sign to
            credit leaderboard points (+20 +7 bonus).
          </>
        )}
      </p>
      {doneToday ? (
        <p className="text-xs text-emerald-400/90">
          Ledger: credited for today (UTC day {todayIndex.toString()}).
          {onChainDoneToday ? " On-chain tx confirmed." : null}
        </p>
      ) : null}

      {siweOnlyMode ? (
        <Button
          type="button"
          variant={compact ? "outline" : "secondary"}
          size="sm"
          className="rounded-full"
          disabled={busy || doneToday}
          onClick={() => void runSiweDaily()}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {claiming ? "Recording…" : "Working…"}
            </span>
          ) : doneToday ? (
            "Checked in today"
          ) : (
            "Sign daily check-in (+20 pts)"
          )}
        </Button>
      ) : (
        <Button
          type="button"
          variant={compact ? "outline" : "secondary"}
          size="sm"
          className="rounded-full"
          disabled={busy || onChainDoneToday}
          onClick={() => void runOnChainCheckIn()}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {confirming || txPending ? "Confirming tx…" : claiming ? "Recording…" : "Working…"}
            </span>
          ) : onChainDoneToday ? (
            ledgerDoneToday ? "Checked in today" : "Sign to credit points"
          ) : chainId !== wantChain.id ? (
            `Switch to ${wantChain.name} & check in`
          ) : (
            "Check in on-chain"
          )}
        </Button>
      )}

      {contractAddress && onChainDoneToday && !ledgerDoneToday ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-zinc-400"
          disabled={busy}
          onClick={() => void runSiweDaily()}
        >
          Sign to credit ledger points
        </Button>
      ) : null}
    </div>
  );
}
