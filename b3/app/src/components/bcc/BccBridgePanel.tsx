import { useMemo, useState } from "react";
import {
  BCC_SYMBOL,
  addressToBytes32,
  bridgeDirectionLabel,
  bridgeTokenSymbol,
  bridgeVaultAbi,
  erc20Abi,
  getBridgeDestEid,
  getBridgeSourceToken,
  isBridgeConfigured,
  oftSendAbi,
  wbccAbi,
  type BccBridgeDirection,
} from "@bc/bcc-kit";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { WalletControls } from "@/components/WalletControls";
import { Button } from "@/components/ui/button";
import { getBccBridgeConfig } from "@/lib/bcc-bridge-config";
import { BSC_BCC_SWAP_CHAIN_ID } from "@/lib/bcc-bsc-swap-config";
import { BCC_SWAP_CHAIN_ID } from "@/lib/bcc-swap-config";
import { bsc, base } from "@/lib/chains";
import { toast } from "sonner";

type BccBridgePanelProps = {
  compact?: boolean;
};

export function BccBridgePanel({ compact = false }: BccBridgePanelProps) {
  const config = getBccBridgeConfig();
  const configured = isBridgeConfigured(config);
  const isRelayer = config.mode === "relayer";

  const [direction, setDirection] = useState<BccBridgeDirection>("base-to-bsc");
  const [amount, setAmount] = useState("100");
  const [pending, setPending] = useState(false);

  const { address, chainId, isConnected } = useAccount();
  const { switchChain, isPending: switchingChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const sourceChainId = direction === "base-to-bsc" ? BCC_SWAP_CHAIN_ID : BSC_BCC_SWAP_CHAIN_ID;
  const onSourceChain = chainId === sourceChainId;
  const sourceToken = getBridgeSourceToken(direction, config);
  const tokenLabel = bridgeTokenSymbol(direction, config);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: sourceToken || undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address && sourceToken ? [address] : undefined,
    query: { enabled: Boolean(address && sourceToken && onSourceChain) },
  });

  const { data: decimals } = useReadContract({
    address: sourceToken || undefined,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: Boolean(sourceToken) },
  });

  const amountWei = useMemo(() => {
    try {
      return parseUnits(amount || "0", decimals ?? 18);
    } catch {
      return 0n;
    }
  }, [amount, decimals]);

  const panelClass = compact ? "space-y-3" : "space-y-4";

  if (!configured) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-400">
          Cross-chain bridge activates after deploy. Set{" "}
          {isRelayer ? (
            <>
              <code className="text-zinc-300">VITE_BCC_BRIDGE_VAULT</code> and{" "}
              <code className="text-zinc-300">VITE_WBCC_BSC_ADDRESS</code>
            </>
          ) : (
            <>
              <code className="text-zinc-300">VITE_BCC_OFT_ADAPTER_ADDRESS</code> and{" "}
              <code className="text-zinc-300">VITE_BCC_BSC_OFT_ADDRESS</code>
            </>
          )}{" "}
          in env.
        </p>
        <p className="text-xs text-zinc-500">
          Canonical BCC on Base locks 1:1; wBCC mints on BNB Chain — no new supply.
        </p>
      </div>
    );
  }

  async function handleRelayerBridge() {
    if (!address || amountWei <= 0n) return;

    if (direction === "base-to-bsc") {
      const vault = config.baseBridgeVault;
      if (!vault) return;

      await writeContractAsync({
        address: config.canonicalBcc,
        abi: erc20Abi,
        functionName: "approve",
        args: [vault, amountWei],
        chainId: sourceChainId,
      });

      await writeContractAsync({
        address: vault,
        abi: bridgeVaultAbi,
        functionName: "lock",
        args: [address, amountWei, BigInt(config.bscChainId)],
        chainId: sourceChainId,
      });

      toast.success("BCC locked — wBCC mints on BNB Chain after relayer confirms (~1–3 min)");
      return;
    }

    const wbcc = config.wbccBsc;
    if (!wbcc) return;

    await writeContractAsync({
      address: wbcc,
      abi: wbccAbi,
      functionName: "bridgeBurn",
      args: [amountWei, BigInt(config.baseChainId)],
      chainId: sourceChainId,
    });

    toast.success("wBCC burned — canonical BCC unlocks on Base after relayer confirms (~1–3 min)");
  }

  async function handleLayerZeroBridge() {
    if (!address || !sourceToken || amountWei <= 0n) return;

    if (direction === "base-to-bsc") {
      await writeContractAsync({
        address: config.canonicalBcc,
        abi: erc20Abi,
        functionName: "approve",
        args: [sourceToken, amountWei],
        chainId: sourceChainId,
      });
    }

    const sendParam = {
      dstEid: getBridgeDestEid(direction),
      to: addressToBytes32(address),
      amountLD: amountWei,
      minAmountLD: amountWei,
      extraOptions: "0x" as `0x${string}`,
      composeMsg: "0x" as `0x${string}`,
      oftCmd: "0x" as `0x${string}`,
    };

    await writeContractAsync({
      address: sourceToken,
      abi: oftSendAbi,
      functionName: "send",
      args: [sendParam, { nativeFee: 0n, lzTokenFee: 0n }, address],
      value: 0n,
      chainId: sourceChainId,
    });

    toast.success(`Bridge submitted — ${bridgeDirectionLabel(direction)}`);
  }

  async function handleBridge() {
    setPending(true);
    try {
      if (isRelayer) {
        await handleRelayerBridge();
      } else {
        await handleLayerZeroBridge();
      }
      void refetchBalance();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bridge failed");
    } finally {
      setPending(false);
    }
  }

  if (!isConnected || !address) {
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-500">
          Connect a wallet to move {BCC_SYMBOL} between Base and BNB Chain.
        </p>
        <WalletControls className="justify-center" />
      </div>
    );
  }

  if (!onSourceChain) {
    const target = direction === "base-to-bsc" ? base : bsc;
    return (
      <div className={panelClass}>
        <p className="text-xs text-zinc-400">
          Switch to {target.name} to bridge {bridgeDirectionLabel(direction)}.
        </p>
        <Button
          type="button"
          disabled={switchingChain}
          onClick={() => switchChain?.({ chainId: sourceChainId })}
          className="w-full rounded-full bg-gradient-to-r from-[#C5FF41] to-[#F0B90B] font-bold text-black"
        >
          {switchingChain ? "Switching…" : `Switch to ${target.name}`}
        </Button>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <div className="flex gap-2">
        {(["base-to-bsc", "bsc-to-base"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              direction === d
                ? "border-[#C5FF41]/50 bg-[#C5FF41]/15 text-[#C5FF41]"
                : "border-white/10 bg-black/30 text-zinc-400 hover:text-white"
            }`}
          >
            {d === "base-to-bsc" ? "Base → BNB" : "BNB → Base"}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        {isRelayer ? (
          <>
            Lock canonical BCC on Base → receive wBCC on BNB. Burn wBCC → unlock BCC on Base.
            Relayer confirms in ~1–3 minutes.
          </>
        ) : (
          <>
            Move the same {BCC_SYMBOL} 1:1 between chains via LayerZero. Supply stays unified.
          </>
        )}
      </p>

      <div className="rounded-xl border border-white/10 bg-black/40 p-3">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Amount
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full bg-transparent text-lg font-semibold text-white outline-none"
        />
        <p className="mt-1 text-[11px] text-zinc-500">
          Balance: {formatUnits(balance ?? 0n, decimals ?? 18)} {tokenLabel}
        </p>
      </div>

      <Button
        type="button"
        disabled={pending || amountWei <= 0n || (balance ?? 0n) < amountWei}
        onClick={() => void handleBridge()}
        className="w-full rounded-full bg-gradient-to-r from-[#C5FF41] to-[#F0B90B] font-bold text-black disabled:opacity-40"
      >
        {pending
          ? "Bridging…"
          : direction === "base-to-bsc"
            ? `Lock BCC → wBCC`
            : `Burn wBCC → BCC`}
      </Button>
    </div>
  );
}
