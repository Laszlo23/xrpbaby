import { useEffect, useRef, useState } from "react";
import { base } from "viem/chains";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { dailyCheckInAbi } from "@/lib/abis/daily-checkin";
import { postCompleteDailyChainCheckIn } from "@/lib/points-fns";

type Props = {
  signSiwe: () => Promise<{ prepared: string; signature: string } | undefined>;
  signingDisabled: boolean;
  onBalance: (balance: number) => void;
};

export function DailyOnChainCheckIn({ signSiwe, signingDisabled, onBalance }: Props) {
  const contractAddress = import.meta.env.VITE_DAILY_CHECKIN_ADDRESS as `0x${string}` | undefined;
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const completeDaily = useServerFn(postCompleteDailyChainCheckIn);
  const { writeContractAsync, isPending: txPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [claiming, setClaiming] = useState(false);
  const processedHash = useRef<string | null>(null);

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
            chainId: base.id,
          },
        });
        if (!res.ok) {
          toast.error(res.error ?? "Could not record daily check-in");
          processedHash.current = null;
          return;
        }
        if (res.alreadyCompleted) {
          toast.message("Already credited for today");
        } else {
          toast.success("Daily on-chain check-in recorded");
        }
        onBalance(res.balance);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Sign failed");
        processedHash.current = null;
      } finally {
        setClaiming(false);
        setHash(undefined);
      }
    })();
  }, [completeDaily, hash, isSuccess, onBalance, signSiwe]);

  async function runCheckIn() {
    if (!contractAddress) {
      toast.error("Set VITE_DAILY_CHECKIN_ADDRESS after deploying DailyCheckIn.");
      return;
    }
    try {
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      const h = await writeContractAsync({
        address: contractAddress,
        abi: dailyCheckInAbi,
        functionName: "checkIn",
      });
      setHash(h);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  if (!isConnected) return null;

  if (!contractAddress) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4">
        <p className="text-sm font-medium text-white">Daily on-chain loop</p>
        <p className="mt-1 text-xs text-zinc-500">
          Deploy <span className="font-mono text-[10px]">DailyCheckIn.sol</span>, then set client{" "}
          <span className="font-mono text-[10px]">VITE_DAILY_CHECKIN_ADDRESS</span> and server{" "}
          <span className="font-mono text-[10px]">DAILY_CHECKIN_CONTRACT_ADDRESS</span> (+ optional{" "}
          <span className="font-mono text-[10px]">BASE_RPC_URL</span>).
        </p>
      </div>
    );
  }

  const busy = txPending || confirming || claiming || signingDisabled;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 space-y-2">
      <p className="font-medium text-white">Daily on-chain check-in (Base)</p>
      <p className="text-xs text-zinc-500">
        Sends a Base transaction once per UTC day, then sign with SIWE to credit points. Gas
        required.
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="rounded-full"
        disabled={busy}
        onClick={() => void runCheckIn()}
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {confirming || txPending ? "Confirming tx…" : claiming ? "Recording…" : "Working…"}
          </span>
        ) : chainId !== base.id ? (
          "Switch to Base & check in"
        ) : (
          "Do it — send check-in tx"
        )}
      </Button>
    </div>
  );
}
