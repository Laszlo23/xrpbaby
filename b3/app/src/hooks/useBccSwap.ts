import {
  BASE_USDC,
  buildEthToBccSwapParams,
  buildUsdcToBccSwapParams,
  erc20Abi,
  minAmountOut,
  swapRouter02Abi,
  UNISWAP_SWAP_ROUTER,
  type BccSwapInput,
} from "@bc/bcc-kit";
import { useCallback, useState } from "react";
import type { Address, Hash } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BCC_SWAP_CHAIN_ID } from "@/lib/bcc-swap-config";

export type BccSwapPhase = "idle" | "approving" | "swapping" | "success" | "error";

export function useBccSwap() {
  const { address, chainId } = useAccount();
  const { writeContractAsync, isPending: writePending } = useWriteContract();
  const [phase, setPhase] = useState<BccSwapPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const onBase = chainId === BCC_SWAP_CHAIN_ID;

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: BASE_USDC as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && onBase ? [address, UNISWAP_SWAP_ROUTER as Address] : undefined,
    query: { enabled: Boolean(address && onBase) },
  });

  const { isLoading: confirming } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) },
  });

  const swap = useCallback(
    async (args: {
      input: BccSwapInput;
      amountInWei: bigint;
      amountOutQuoted: bigint;
      bccWethFee: number;
      slippageBps: number;
    }) => {
      if (!address) {
        setError("Connect a wallet first");
        setPhase("error");
        return false;
      }
      if (!onBase) {
        setError("Switch to Base network");
        setPhase("error");
        return false;
      }

      const amountOutMinimum = minAmountOut(args.amountOutQuoted, args.slippageBps);
      setError(null);
      setTxHash(null);

      try {
        if (args.input === "usdc") {
          const needsApprove = (usdcAllowance ?? 0n) < args.amountInWei;
          if (needsApprove) {
            setPhase("approving");
            await writeContractAsync({
              address: BASE_USDC as Address,
              abi: erc20Abi,
              functionName: "approve",
              args: [UNISWAP_SWAP_ROUTER as Address, args.amountInWei],
              chainId: BCC_SWAP_CHAIN_ID,
            });
            await refetchAllowance();
          }

          setPhase("swapping");
          const params = buildUsdcToBccSwapParams({
            recipient: address,
            amountIn: args.amountInWei,
            amountOutMinimum,
            bccWethFee: args.bccWethFee,
          });
          const hash = await writeContractAsync({
            address: UNISWAP_SWAP_ROUTER as Address,
            abi: swapRouter02Abi,
            functionName: "exactInput",
            args: [params],
            chainId: BCC_SWAP_CHAIN_ID,
          });
          setTxHash(hash);
        } else {
          setPhase("swapping");
          const params = buildEthToBccSwapParams({
            recipient: address,
            amountInWei: args.amountInWei,
            amountOutMinimum,
            fee: args.bccWethFee,
          });
          const hash = await writeContractAsync({
            address: UNISWAP_SWAP_ROUTER as Address,
            abi: swapRouter02Abi,
            functionName: "exactInputSingle",
            args: [params],
            value: args.amountInWei,
            chainId: BCC_SWAP_CHAIN_ID,
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
    [address, onBase, usdcAllowance, writeContractAsync, refetchAllowance],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setTxHash(null);
  }, []);

  const needsUsdcApproval = useCallback(
    (amount: bigint) => (usdcAllowance ?? 0n) < amount,
    [usdcAllowance],
  );

  return {
    swap,
    reset,
    phase,
    error,
    txHash,
    confirming,
    isPending: writePending || confirming,
    needsUsdcApproval,
    usdcAllowance,
  };
}
