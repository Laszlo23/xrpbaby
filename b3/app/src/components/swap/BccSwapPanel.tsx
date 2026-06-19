import { useFundWallet } from "@privy-io/react-auth";
import { useMemo, useState } from "react";
import {
  BCC_ADDRESS,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
  BCC_SWAP_TOKEN,
  erc20Abi,
  type BccSwapInput,
} from "@bc/bcc-kit";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useAccount, useBalance, useReadContract, useSwitchChain } from "wagmi";
import { WalletControls } from "@/components/WalletControls";
import { Button } from "@/components/ui/button";
import { useBccSwap } from "@/hooks/useBccSwap";
import { useBccSwapQuote } from "@/hooks/useBccSwapQuote";
import {
  BCC_SWAP_CHAIN,
  BCC_SWAP_CHAIN_ID,
  bccSwapExplorerTx,
  DEFAULT_BCC_SWAP_SLIPPAGE_BPS,
  DEFAULT_ONRAMP_ETH_AMOUNT,
  DEFAULT_ONRAMP_USDC_AMOUNT,
} from "@/lib/bcc-swap-config";
import { privyEnabled } from "@/lib/privy-env";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { toast } from "sonner";

type BccSwapPanelProps = {
  /** Tighter layout for Buy BCC modal. */
  compact?: boolean;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function BccSwapPanel({ compact = false }: BccSwapPanelProps) {
  const [input, setInput] = useState<BccSwapInput>("eth");
  const [amount, setAmount] = useState("0.01");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_BCC_SWAP_SLIPPAGE_BPS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { isConnected, chainId, address: wagmiAddress } = useAccount();
  const privyAddress = usePrivyWalletAddress();
  const address = (wagmiAddress ?? privyAddress) as `0x${string}` | undefined;
  const { switchChain, isPending: switchingChain } = useSwitchChain();
  const { fundWallet } = useFundWallet();

  const onBase = chainId === BCC_SWAP_CHAIN_ID;

  const { data: ethBalance } = useBalance({
    address,
    chainId: BCC_SWAP_CHAIN_ID,
    query: { enabled: Boolean(address && onBase) },
  });

  const { data: usdcBalance } = useReadContract({
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && onBase) },
  });

  const { data: bccBalance, refetch: refetchBcc } = useReadContract({
    address: BCC_SWAP_TOKEN,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && onBase) },
  });

  const { data: bccDecimals } = useReadContract({
    address: BCC_SWAP_TOKEN,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: onBase },
  });

  const amountInWei = useMemo(() => {
    try {
      if (input === "eth") return parseEther(amount || "0");
      return parseUnits(amount || "0", 6);
    } catch {
      return 0n;
    }
  }, [amount, input]);

  const hasFunds = input === "eth" ? (ethBalance?.value ?? 0n) > 0n : (usdcBalance ?? 0n) > 0n;

  const canAfford =
    amountInWei > 0n &&
    (input === "eth"
      ? (ethBalance?.value ?? 0n) >= amountInWei
      : (usdcBalance ?? 0n) >= amountInWei);

  const quote = useBccSwapQuote({
    input,
    amountInWei,
    enabled: isConnected && onBase && amountInWei > 0n,
  });

  const swapHook = useBccSwap();

  const bccDec = bccDecimals ?? 18;

  async function handleFund() {
    if (!address) return;
    try {
      if (privyEnabled) {
        await fundWallet({
          address,
          options: {
            chain: BCC_SWAP_CHAIN,
            amount: input === "eth" ? DEFAULT_ONRAMP_ETH_AMOUNT : DEFAULT_ONRAMP_USDC_AMOUNT,
            asset: input === "eth" ? "native-currency" : "USDC",
          },
        });
      } else {
        window.open("https://bridge.base.org", "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Funding cancelled");
    }
  }

  async function handleSwap() {
    if (!quote.amountOut || quote.bccWethFee === null) return;
    const ok = await swapHook.swap({
      input,
      amountInWei,
      amountOutQuoted: quote.amountOut,
      bccWethFee: quote.bccWethFee,
      slippageBps,
    });
    if (ok) {
      toast.success(`${BCC_SYMBOL} swap submitted`);
      void refetchBcc();
    }
  }

  const panelClass = compact ? "space-y-3" : "space-y-4";

  if (!isConnected || !address) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-500">
          Connect a Base wallet to swap {input === "eth" ? "ETH" : "USDC"} for {BCC_SYMBOL} without
          leaving the app.
        </p>
        <WalletControls className="justify-center" />
      </div>
    );
  }

  if (!onBase) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-400">
          {BCC_SYMBOL} swaps run on Base. Switch network to continue.
        </p>
        <Button
          type="button"
          size="sm"
          disabled={switchingChain}
          onClick={() => switchChain?.({ chainId: BCC_SWAP_CHAIN_ID })}
          className="w-full rounded-full bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] font-bold text-black hover:opacity-90"
        >
          {switchingChain ? "Switching…" : "Switch to Base"}
        </Button>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <div className="flex gap-2">
        {(["eth", "usdc"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setInput(t)}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              input === t
                ? "border-[#C5FF41]/50 bg-[#C5FF41]/15 text-[#C5FF41]"
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
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none"
            placeholder="0.0"
          />
          <button
            type="button"
            onClick={() => {
              if (input === "eth" && ethBalance) {
                const gasReserve = parseEther("0.001");
                const max = ethBalance.value > gasReserve ? ethBalance.value - gasReserve : 0n;
                setAmount(formatEther(max));
              } else if (input === "usdc" && usdcBalance !== undefined) {
                setAmount(formatUnits(usdcBalance, 6));
              }
            }}
            className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-white"
          >
            Max
          </button>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          Balance:{" "}
          {input === "eth"
            ? `${formatEther(ethBalance?.value ?? 0n)} ETH`
            : `${formatUnits(usdcBalance ?? 0n, 6)} USDC`}
          {bccBalance !== undefined ? (
            <>
              {" "}
              · {formatUnits(bccBalance, Number(bccDec))} {BCC_SYMBOL}
            </>
          ) : null}
        </p>
      </div>

      <div className="rounded-xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 p-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          You receive (estimate)
        </label>
        <p className="mt-1 text-lg font-semibold text-[#C5FF41]">
          {quote.loading
            ? "Fetching quote…"
            : quote.amountOut
              ? `~${formatUnits(quote.amountOut, Number(bccDec))} ${BCC_SYMBOL}`
              : amountInWei > 0n
                ? "—"
                : "Enter an amount"}
        </p>
        {quote.error ? <p className="mt-1 text-[11px] text-amber-400/90">{quote.error}</p> : null}
      </div>

      {!hasFunds ? (
        <div className="space-y-2 rounded-xl border border-[#00E5FF]/25 bg-[#00E5FF]/5 p-3">
          <p className="text-xs text-zinc-300">
            Your wallet has no {input === "eth" ? "ETH" : "USDC"} on Base. Add funds with a card,
            then swap here.
          </p>
          <Button
            type="button"
            onClick={() => void handleFund()}
            className="w-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#00E5FF] font-bold text-white hover:opacity-90"
          >
            {privyEnabled ? "Add funds with card" : "Bridge to Base"}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          disabled={
            !canAfford ||
            !quote.amountOut ||
            quote.bccWethFee === null ||
            quote.loading ||
            swapHook.isPending
          }
          onClick={() => void handleSwap()}
          className="w-full rounded-full bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] font-bold text-black hover:opacity-90 disabled:opacity-40"
        >
          {swapHook.isPending
            ? swapHook.phase === "approving"
              ? "Approving USDC…"
              : "Swapping…"
            : `Swap for ${BCC_SYMBOL}`}
        </Button>
      )}

      {swapHook.error ? <p className="text-xs text-red-400">{swapHook.error}</p> : null}

      {swapHook.txHash ? (
        <p className="text-xs text-zinc-400">
          Tx{" "}
          <a
            href={bccSwapExplorerTx(swapHook.txHash)}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[#C5FF41] hover:underline"
          >
            {shortAddr(swapHook.txHash)}
          </a>
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setAdvancedOpen((o) => !o)}
        className="text-[11px] text-zinc-500 hover:text-zinc-300"
      >
        {advancedOpen ? "Hide" : "Show"} slippage & fallback
      </button>

      {advancedOpen ? (
        <div className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
          <label className="flex items-center justify-between gap-2 text-zinc-400">
            <span>Slippage tolerance</span>
            <select
              value={slippageBps}
              onChange={(e) => setSlippageBps(Number(e.target.value))}
              className="rounded border border-white/15 bg-black/50 px-2 py-1 text-white"
            >
              <option value={30}>0.3%</option>
              <option value={50}>0.5%</option>
              <option value={100}>1%</option>
              <option value={300}>3%</option>
            </select>
          </label>
          <a
            href={BCC_UNISWAP_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="block text-[#C5FF41] hover:underline"
          >
            Open in Uniswap →
          </a>
          <p className="font-mono text-[10px] text-zinc-600">{BCC_ADDRESS}</p>
        </div>
      ) : null}
    </div>
  );
}
