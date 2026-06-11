import { useMemo, useState } from "react";
import {
  BCC_SYMBOL,
  BSC_USDT_SWAP,
  erc20Abi,
  type BscSwapInput,
} from "@bc/bcc-kit";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { WalletControls } from "@/components/WalletControls";
import { Button } from "@/components/ui/button";
import { useBscBccSwap } from "@/hooks/useBscBccSwap";
import { useBscBccSwapQuote } from "@/hooks/useBscBccSwapQuote";
import {
  BSC_BCC_SWAP_CHAIN_ID,
  bscBccSwapExplorerTx,
  DEFAULT_BSC_BCC_SWAP_SLIPPAGE_BPS,
  getBccBscOftAddress,
  isBscSwapConfigured,
} from "@/lib/bcc-bsc-swap-config";
import { BccBnbBridgePanel } from "@/components/bcc/BccBnbBridgePanel";
import { toast } from "sonner";

type BscBccSwapPanelProps = {
  compact?: boolean;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function BscBccSwapPanel({ compact = false }: BscBccSwapPanelProps) {
  const bccToken = getBccBscOftAddress();
  const configured = isBscSwapConfigured();

  const [input, setInput] = useState<BscSwapInput>("bnb");
  const [amount, setAmount] = useState("0.05");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_BSC_BCC_SWAP_SLIPPAGE_BPS);

  const { isConnected, chainId, address } = useAccount();
  const { switchChain, isPending: switchingChain } = useSwitchChain();

  const onBsc = chainId === BSC_BCC_SWAP_CHAIN_ID;

  const { data: bnbBalance } = useBalance({
    address,
    chainId: BSC_BCC_SWAP_CHAIN_ID,
    query: { enabled: Boolean(address && onBsc) },
  });

  const { data: usdtBalance } = useReadContract({
    address: BSC_USDT_SWAP as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && onBsc) },
  });

  const { data: bccBalance, refetch: refetchBcc } = useReadContract({
    address: bccToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address && bccToken ? [address] : undefined,
    query: { enabled: Boolean(address && onBsc && bccToken) },
  });

  const { data: bccDecimals } = useReadContract({
    address: bccToken,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: Boolean(onBsc && bccToken) },
  });

  const amountInWei = useMemo(() => {
    try {
      if (input === "bnb") return parseEther(amount || "0");
      return parseUnits(amount || "0", 18);
    } catch {
      return 0n;
    }
  }, [amount, input]);

  const quote = useBscBccSwapQuote({
    input,
    amountInWei,
    enabled: isConnected && onBsc && configured && amountInWei > 0n,
  });

  const swapHook = useBscBccSwap();
  const bccDec = bccDecimals ?? 18;
  const panelClass = compact ? "space-y-3" : "space-y-4";

  if (!configured) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-400">
          Native BSC swap activates after BCC OFT deploy. Bridge from BNB to Base now — same token,
          no new coin.
        </p>
        <BccBnbBridgePanel compact />
      </div>
    );
  }

  async function handleSwap() {
    if (!quote.amountOut || quote.bccWbnbFee === null) return;
    const ok = await swapHook.swap({
      input,
      amountInWei,
      amountOutQuoted: quote.amountOut,
      bccWbnbFee: quote.bccWbnbFee,
      slippageBps,
    });
    if (ok) {
      toast.success(`${BCC_SYMBOL} swap submitted on BNB Chain`);
      void refetchBcc();
    }
  }

  if (!isConnected || !address) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-500">
          Connect a BNB Chain wallet to swap BNB or USDT for bridged {BCC_SYMBOL}.
        </p>
        <WalletControls className="justify-center" />
      </div>
    );
  }

  if (!onBsc) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-400">Switch to BNB Chain to swap into the BSC pool.</p>
        <Button
          type="button"
          size="sm"
          disabled={switchingChain}
          onClick={() => switchChain?.({ chainId: BSC_BCC_SWAP_CHAIN_ID })}
          className="w-full rounded-full bg-gradient-to-r from-[#F0B90B] to-[#00E5FF] font-bold text-black hover:opacity-90"
        >
          {switchingChain ? "Switching…" : "Switch to BNB Chain"}
        </Button>
      </div>
    );
  }

  const canAfford =
    amountInWei > 0n &&
    (input === "bnb"
      ? (bnbBalance?.value ?? 0n) >= amountInWei
      : (usdtBalance ?? 0n) >= amountInWei);

  return (
    <div className={panelClass}>
      <div className="flex gap-2">
        {(["bnb", "usdt"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setInput(t)}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              input === t
                ? "border-[#F0B90B]/50 bg-[#F0B90B]/15 text-[#F0B90B]"
                : "border-white/10 bg-black/30 text-zinc-400 hover:text-white"
            }`}
          >
            Pay with {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          You pay
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full bg-transparent text-lg font-semibold text-white outline-none"
          placeholder="0.0"
        />
        <p className="mt-1 text-[11px] text-zinc-500">
          Balance:{" "}
          {input === "bnb"
            ? `${formatEther(bnbBalance?.value ?? 0n)} BNB`
            : `${formatUnits(usdtBalance ?? 0n, 18)} USDT`}
          {bccBalance !== undefined ? (
            <>
              {" "}
              · {formatUnits(bccBalance, Number(bccDec))} {BCC_SYMBOL}
            </>
          ) : null}
        </p>
      </div>

      <div className="rounded-xl border border-[#F0B90B]/20 bg-[#F0B90B]/5 p-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          You receive (estimate)
        </label>
        <p className="mt-1 text-lg font-semibold text-[#F0B90B]">
          {quote.loading
            ? "Fetching quote…"
            : quote.amountOut
              ? `~${formatUnits(quote.amountOut, Number(bccDec))} ${BCC_SYMBOL}`
              : "Enter an amount"}
        </p>
        {quote.error ? <p className="mt-1 text-[11px] text-amber-400/90">{quote.error}</p> : null}
      </div>

      <Button
        type="button"
        disabled={
          !canAfford ||
          !quote.amountOut ||
          quote.bccWbnbFee === null ||
          quote.loading ||
          swapHook.isPending
        }
        onClick={() => void handleSwap()}
        className="w-full rounded-full bg-gradient-to-r from-[#F0B90B] to-[#00E5FF] font-bold text-black hover:opacity-90 disabled:opacity-40"
      >
        {swapHook.isPending ? "Swapping…" : `Swap for ${BCC_SYMBOL} on BSC`}
      </Button>

      {swapHook.error ? <p className="text-xs text-red-400">{swapHook.error}</p> : null}

      {swapHook.txHash ? (
        <p className="text-xs text-zinc-400">
          Tx{" "}
          <a
            href={bscBccSwapExplorerTx(swapHook.txHash)}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[#F0B90B] hover:underline"
          >
            {shortAddr(swapHook.txHash)}
          </a>
        </p>
      ) : null}

      <label className="flex items-center justify-between gap-2 text-xs text-zinc-400">
        <span>Slippage</span>
        <select
          value={slippageBps}
          onChange={(e) => setSlippageBps(Number(e.target.value))}
          className="rounded border border-white/15 bg-black/50 px-2 py-1 text-white"
        >
          <option value={30}>0.3%</option>
          <option value={50}>0.5%</option>
          <option value={100}>1%</option>
        </select>
      </label>

      <p className="text-[10px] text-zinc-600">
        PancakeSwap V3 · BNB Chain · 1:1 with Base {BCC_SYMBOL}
      </p>
    </div>
  );
}
