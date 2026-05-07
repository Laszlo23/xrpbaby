import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { erc20Abi } from "@/lib/bcd-abi";
import { BCD_SYMBOL, getBcdTokenAddress, getDemoBcdBalanceDisplay } from "@/lib/bcd-config";
import { getBcdChainShortLabel, isBcdChain } from "@/lib/chains";

export type BcdBalanceState =
  | { status: "no_token"; label: string; isDemo: true }
  | { status: "disconnected"; label: string; isDemo: false }
  | { status: "loading"; label: string; isDemo: false }
  | { status: "ready"; label: string; raw: bigint; isDemo: false };

export function useBcdBalance(): BcdBalanceState {
  const token = getBcdTokenAddress();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const onBcdChain = isBcdChain(chainId);

  const { data: decimals } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!token && onBcdChain },
  });

  const { data: balance, isLoading } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!token && !!address && onBcdChain },
  });

  if (!token) {
    return {
      status: "no_token",
      label: `${getDemoBcdBalanceDisplay()} ${BCD_SYMBOL}`,
      isDemo: true,
    };
  }

  if (isConnected && address && !onBcdChain) {
    return {
      status: "no_token",
      label: `Switch to ${getBcdChainShortLabel()} for ${BCD_SYMBOL}`,
      isDemo: true,
    };
  }

  if (!isConnected || !address) {
    return { status: "disconnected", label: `0 ${BCD_SYMBOL}`, isDemo: false };
  }

  if (isLoading || balance === undefined || decimals === undefined) {
    return { status: "loading", label: "…", isDemo: false };
  }

  const dec = Number(decimals);
  const safeDec = Number.isFinite(dec) && dec >= 0 && dec <= 36 ? dec : 18;
  const formatted = formatUnits(balance, safeDec);
  const n = Number(formatted);
  const label =
    Number.isFinite(n) && n >= 1000
      ? `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${BCD_SYMBOL}`
      : `${formatted} ${BCD_SYMBOL}`;

  return { status: "ready", label, raw: balance, isDemo: false };
}
