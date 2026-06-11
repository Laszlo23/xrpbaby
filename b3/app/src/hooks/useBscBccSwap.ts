import {
  BSC_USDT_SWAP,
  PANCAKE_SWAP_ROUTER,
  buildBnbToBccSwapParams,
  buildUsdtToBccSwapParams,
  erc20Abi,
  minAmountOut,
  swapRouter02Abi,
  type BscSwapInput,
} from "@bc/bcc-kit";
import { useCallback, useState } from "react";
import type { Address, Hash } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  BSC_BCC_SWAP_CHAIN_ID,
  getBccBscOftAddress,
} from "@/lib/bcc-bsc-swap-config";

export type BscBccSwapPhase = "idle" | "approving" | "swapping" | "success" | "error";

export function useBscBccSwap() {
  const { address, chainId } = useAccount();
  const bccToken = getBccBscOftAddress();
  const { writeContractAsync, isPending: writePending } = useWriteContract();
  const [phase, setPhase] = useState<BscBccSwapPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const onBsc = chainId === BSC_BCC_SWAP_CHAIN_ID;

  const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
    address: BSC_USDT_SWAP as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && bccToken ? [address, PANCAKE_SWAP_ROUTER as Address] : undefined,
    query: { enabled: Boolean(address && onBsc && bccToken) },
  });

  const { isLoading: confirming } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) },
  });

  const swap = useCallback(
    async (args: {
      input: BscSwapInput;
      amountInWei: bigint;
      amountOutQuoted: bigint;
      bccWbnbFee: number;
      slippageBps: number;
    }) => {
      if (!address) {
        setError("Connect a wallet first");
        setPhase("error");
        return false;
      }
      if (!bccToken) {
        setError("BSC BCC OFT not configured");
        setPhase("error");
        return false;
      }
      if (!onBsc) {
        setError("Switch to BNB Chain");
        setPhase("error");
        return false;
      }

      const amountOutMinimum = minAmountOut(args.amountOutQuoted, args.slippageBps);
      setError(null);
      setTxHash(null);

      try {
        if (args.input === "usdt") {
          const needsApprove = (usdtAllowance ?? 0n) < args.amountInWei;
          if (needsApprove) {
            setPhase("approving");
            await writeContractAsync({
              address: BSC_USDT_SWAP as Address,
              abi: erc20Abi,
              functionName: "approve",
              args: [PANCAKE_SWAP_ROUTER as Address, args.amountInWei],
              chainId: BSC_BCC_SWAP_CHAIN_ID,
            });
            await refetchAllowance();
          }

          setPhase("swapping");
          const params = buildUsdtToBccSwapParams({
            bccToken,
            recipient: address,
            amountIn: args.amountInWei,
            amountOutMinimum,
            bccWbnbFee: args.bccWbnbFee,
          });
          const hash = await writeContractAsync({
            address: PANCAKE_SWAP_ROUTER as Address,
            abi: swapRouter02Abi,
            functionName: "exactInput",
            args: [params],
            chainId: BSC_BCC_SWAP_CHAIN_ID,
          });
          setTxHash(hash);
        } else {
          setPhase("swapping");
          const params = buildBnbToBccSwapParams({
            bccToken,
            recipient: address,
            amountInWei: args.amountInWei,
            amountOutMinimum,
            fee: args.bccWbnbFee,
          });
          const hash = await writeContractAsync({
            address: PANCAKE_SWAP_ROUTER as Address,
            abi: swapRouter02Abi,
            functionName: "exactInputSingle",
            args: [params],
            value: args.amountInWei,
            chainId: BSC_BCC_SWAP_CHAIN_ID,
          });
          setTxHash(hash);
        }
        setPhase("success");
        return true;
      } catch (e) {
        setPhase("error");
        setError(e instanceof Error ? e.message : "Swap failed");
        return false;
      }
    },
    [address, bccToken, onBsc, usdtAllowance, writeContractAsync, refetchAllowance],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setTxHash(null);
  }, []);

  return {
    swap,
    reset,
    phase,
    error,
    txHash,
    confirming,
    isPending: writePending || confirming,
  };
}
