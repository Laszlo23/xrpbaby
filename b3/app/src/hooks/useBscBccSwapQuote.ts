import {
  PANCAKE_QUOTER_V2,
  PANCAKE_V3_FACTORY,
  BSC_USDT_SWAP,
  BSC_WBNB,
  encodeUsdtToBccPath,
  quoterV2Abi,
  resolveBscBccPoolFee,
  uniV3FactoryAbi,
  type BscSwapInput,
} from "@bc/bcc-kit";
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";
import { BSC_BCC_SWAP_CHAIN_ID, getBccBscOftAddress } from "@/lib/bcc-bsc-swap-config";

export type BscBccSwapQuoteState = {
  amountOut: bigint | null;
  bccWbnbFee: number | null;
  loading: boolean;
  error: string | null;
};

export function useBscBccSwapQuote(args: {
  input: BscSwapInput;
  amountInWei: bigint;
  enabled?: boolean;
}): BscBccSwapQuoteState {
  const { input, amountInWei, enabled = true } = args;
  const bccToken = getBccBscOftAddress();
  const publicClient = usePublicClient({ chainId: BSC_BCC_SWAP_CHAIN_ID });
  const [amountOut, setAmountOut] = useState<bigint | null>(null);
  const [bccWbnbFee, setBccWbnbFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feeResolved = useRef(false);

  useEffect(() => {
    if (!publicClient || !bccToken || feeResolved.current) return;
    let cancelled = false;
    void resolveBscBccPoolFee(bccToken, async (tokenA, tokenB, fee) => {
      const pool = await publicClient.readContract({
        address: PANCAKE_V3_FACTORY as Address,
        abi: uniV3FactoryAbi,
        functionName: "getPool",
        args: [tokenA, tokenB, fee],
      });
      return pool as Address;
    }).then((fee) => {
      if (!cancelled) {
        setBccWbnbFee(fee);
        feeResolved.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [publicClient, bccToken]);

  useEffect(() => {
    if (!publicClient || !bccToken || !enabled || amountInWei <= 0n || bccWbnbFee === null) {
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
          if (input === "bnb") {
            const sim = await publicClient.simulateContract({
              address: PANCAKE_QUOTER_V2 as Address,
              abi: quoterV2Abi,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: BSC_WBNB,
                  tokenOut: bccToken,
                  amountIn: amountInWei,
                  fee: bccWbnbFee,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            });
            quoted = sim.result[0];
          } else {
            const path = encodeUsdtToBccPath(bccToken, bccWbnbFee);
            const sim = await publicClient.simulateContract({
              address: PANCAKE_QUOTER_V2 as Address,
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
  }, [publicClient, bccToken, enabled, amountInWei, input, bccWbnbFee]);

  return { amountOut, bccWbnbFee, loading, error };
}
