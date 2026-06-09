import {
  BASE_USDC,
  BASE_WETH,
  BCC_SWAP_TOKEN,
  encodeUsdcToBccPath,
  quoterV2Abi,
  resolveBccPoolFee,
  uniV3FactoryAbi,
  UNISWAP_QUOTER_V2,
  UNISWAP_V3_FACTORY,
  type BccSwapInput,
} from "@bc/bcc-kit";
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";
import { BCC_SWAP_CHAIN_ID } from "@/lib/bcc-swap-config";

export type BccSwapQuoteState = {
  amountOut: bigint | null;
  bccWethFee: number | null;
  loading: boolean;
  error: string | null;
};

export function useBccSwapQuote(args: {
  input: BccSwapInput;
  amountInWei: bigint;
  enabled?: boolean;
}): BccSwapQuoteState {
  const { input, amountInWei, enabled = true } = args;
  const publicClient = usePublicClient({ chainId: BCC_SWAP_CHAIN_ID });
  const [amountOut, setAmountOut] = useState<bigint | null>(null);
  const [bccWethFee, setBccWethFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feeResolved = useRef(false);

  useEffect(() => {
    if (!publicClient || feeResolved.current) return;
    let cancelled = false;
    void resolveBccPoolFee(async (tokenA, tokenB, fee) => {
      const pool = await publicClient.readContract({
        address: UNISWAP_V3_FACTORY as Address,
        abi: uniV3FactoryAbi,
        functionName: "getPool",
        args: [tokenA, tokenB, fee],
      });
      return pool as Address;
    }).then((fee) => {
      if (!cancelled) {
        setBccWethFee(fee);
        feeResolved.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  useEffect(() => {
    if (!publicClient || !enabled || amountInWei <= 0n || bccWethFee === null) {
      setAmountOut(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      void (async () => {
        try {
          let quoted: bigint;
          if (input === "eth") {
            const sim = await publicClient.simulateContract({
              address: UNISWAP_QUOTER_V2 as Address,
              abi: quoterV2Abi,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: BASE_WETH,
                  tokenOut: BCC_SWAP_TOKEN,
                  amountIn: amountInWei,
                  fee: bccWethFee,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            });
            quoted = sim.result[0];
          } else {
            const path = encodeUsdcToBccPath(bccWethFee);
            const sim = await publicClient.simulateContract({
              address: UNISWAP_QUOTER_V2 as Address,
              abi: quoterV2Abi,
              functionName: "quoteExactInput",
              args: [path, amountInWei],
            });
            quoted = sim.result[0];
          }
          if (!cancelled) {
            setAmountOut(quoted);
            setError(null);
          }
        } catch (e) {
          if (!cancelled) {
            setAmountOut(null);
            setError(e instanceof Error ? e.message : "Quote unavailable");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [publicClient, enabled, amountInWei, input, bccWethFee]);

  return { amountOut, bccWethFee, loading, error };
}
