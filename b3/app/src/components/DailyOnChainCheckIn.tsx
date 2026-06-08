import { useEffect, useRef, useState } from "react";
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
import { postCompleteDailyChainCheckIn } from "@/lib/points-fns";
import { claimDaily } from "@/lib/playerProgress";

type Props = {
  signSiwe: () => Promise<{ prepared: string; signature: string } | undefined>;
  signingDisabled: boolean;
  onBalance?: (balance: number) => void;
  /** Profile XP (+50 / vault bonus) after a successful on-chain check-in. */
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
  const { writeContractAsync, isPending: txPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [claiming, setClaiming] = useState(false);
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

  useEffect(() => {
    if (!isSuccess || !hash || processedHash.current === hash) return;
    processedHash.current = hash;
    void (async () => {
      setClaiming(true);
      try {
        const signed = await signSiwe();
        if (!signed) {
          processedHash.current = null;
          return;
        }
        const res = await completeDaily({
          data: {
            message: signed.prepared,
            signature: signed.signature,
            txHash: hash,
            chainId: wantChain.id,
          },
        });
        if (!res.ok) {
          toast.error(res.error ?? "Could not record daily check-in");
          processedHash.current = null;
          return;
        }

        if (address && onLocalDailyClaim) {
          const local = claimDaily(address, { genesisVaultBonusXp });
          if (local.ok) {
            onLocalDailyClaim();
          }
        }

        if (res.alreadyCompleted) {
          toast.message("On-chain check-in verified · points already credited today");
        } else {
          const bonusText =
            res.bonusGranted && (res.bonusPoints ?? 0) > 0
              ? ` +${res.bonusPoints} signature bonus`
              : "";
          toast.success(`Daily check-in saved on-chain (+ ledger points${bonusText})`);
        }
        onBalance?.(res.balance);
        void refetchLastDay();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Sign failed");
        processedHash.current = null;
      } finally {
        setClaiming(false);
        setHash(undefined);
      }
    })();
  }, [
    address,
    completeDaily,
    genesisVaultBonusXp,
    hash,
    isSuccess,
    onBalance,
    onLocalDailyClaim,
    refetchLastDay,
    signSiwe,
    wantChain.id,
  ]);

  async function runCheckIn() {
    if (!contractAddress) {
      toast.error("Deploy DailyCheckIn and set VITE_DAILY_CHECKIN_ADDRESS.");
      return;
    }
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

  if (!isConnected) return null;

  if (!contractAddress) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4">
        <p className="text-sm font-medium text-white">Daily check-in (on-chain)</p>
        <p className="mt-1 text-xs text-zinc-500">
          Deploy{" "}
          <span className="font-mono text-[10px]">contracts/script/DeployDailyCheckIn.s.sol</span>,
          then set <span className="font-mono text-[10px]">VITE_DAILY_CHECKIN_ADDRESS</span> and
          server <span className="font-mono text-[10px]">DAILY_CHECKIN_CONTRACT_ADDRESS</span>.
        </p>
      </div>
    );
  }

  const busy = txPending || confirming || claiming || signingDisabled;

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
        Daily check-in on {wantChain.name}
      </p>
      <p className="text-xs text-zinc-500">
        One <span className="font-mono">checkIn()</span> tx per UTC day — stored on-chain (
        <span className="font-mono">CheckedIn</span> event +{" "}
        <span className="font-mono">lastCheckInDay</span>
        ). Then sign to credit leaderboard points and unlock a once-per-day signature attestation
        bonus.
      </p>
      {onChainDoneToday ? (
        <p className="text-xs text-emerald-400/90">
          On-chain: checked in for today (UTC day {todayIndex.toString()}).
        </p>
      ) : null}
      <Button
        type="button"
        variant={compact ? "outline" : "secondary"}
        size="sm"
        className="rounded-full"
        disabled={busy || onChainDoneToday}
        onClick={() => void runCheckIn()}
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {confirming || txPending ? "Confirming tx…" : claiming ? "Recording…" : "Working…"}
          </span>
        ) : onChainDoneToday ? (
          "Checked in on-chain today"
        ) : chainId !== wantChain.id ? (
          `Switch to ${wantChain.name} & check in`
        ) : (
          "Check in on-chain"
        )}
      </Button>
    </div>
  );
}
