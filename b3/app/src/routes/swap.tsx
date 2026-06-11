import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { BccSwapPanel } from "@/components/swap/BccSwapPanel";
import { BscBccSwapPanel } from "@/components/swap/BscBccSwapPanel";
import { BccBnbBridgePanel } from "@/components/bcc/BccBnbBridgePanel";
import { PoolStatsCard } from "@/components/liquidity/PoolStatsCard";
import { BCC_SYMBOL } from "@bc/bcc-kit";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { isBscSwapConfigured } from "@/lib/bcc-bsc-swap-config";

type BccMarketResponse = {
  ok: boolean;
  combinedLiquidityUsd: number | null;
  pools: Array<{
    dex: string;
    liquidityUsd: number | null;
    volume24hUsd: number | null;
    priceUsd: number | null;
    url: string | null;
  }>;
};

type SwapChain = "base" | "bnb";

export const Route = createFileRoute("/swap")({
  head: () =>
    pageHead({
      title: `Swap ${BCC_SYMBOL} — ${BRAND_DISPLAY_NAME}`,
      description: `Buy ${BCC_SYMBOL} on Base or BNB Chain — in-app swap into the fair-launch pool.`,
      path: "/swap",
      keywords: ["BCC", "swap", "Uniswap", "PancakeSwap", "Base", "BNB", "on-ramp"],
    }),
  component: SwapPage,
});

function SwapPage() {
  const [chain, setChain] = useState<SwapChain>("base");
  const bscNative = isBscSwapConfigured();

  const { data: market } = useQuery({
    queryKey: ["bcc-market"],
    queryFn: async () => {
      const res = await fetch("/api/market/bcc");
      return res.json() as Promise<BccMarketResponse>;
    },
    staleTime: 60_000,
  });

  return (
    <MarketingShell
      eyebrow={chain === "base" ? "On Base" : "BNB Chain"}
      title={`Swap for ${BCC_SYMBOL}`}
      subtitle={
        chain === "base"
          ? `Buy ${BCC_SYMBOL} with ETH or USDC via Uniswap V3 — stay in the app.`
          : bscNative
            ? `Swap BNB or USDT for bridged ${BCC_SYMBOL} on PancakeSwap V3 — same token, 1:1 with Base.`
            : `Bridge BNB to Base and buy into the fair-launch pool — same ${BCC_SYMBOL}, no new coin.`
      }
      tone="cyan"
      articleClassName="max-w-lg"
    >
      <div className="space-y-8">
        <div className="flex gap-2">
          {(["base", "bnb"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChain(c)}
              className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                chain === c
                  ? c === "base"
                    ? "border-[#C5FF41]/50 bg-[#C5FF41]/15 text-[#C5FF41]"
                    : "border-[#F0B90B]/50 bg-[#F0B90B]/15 text-[#F0B90B]"
                  : "border-white/10 bg-black/30 text-zinc-400 hover:text-white"
              }`}
            >
              {c === "base" ? "Base (Uniswap)" : "BNB Chain"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#C5FF41]/25 bg-black/40 p-5">
          {chain === "base" ? (
            <BccSwapPanel />
          ) : bscNative ? (
            <BscBccSwapPanel />
          ) : (
            <BccBnbBridgePanel />
          )}
        </div>

        {market?.ok ? (
          <div className="mt-8">
            <PoolStatsCard
              stats={{
                combinedLiquidityUsd: market.combinedLiquidityUsd,
                pools: market.pools,
                redemption: { percentToGate: null, minPoolTvlUsd: 0, ready: false },
              }}
              loading={false}
            />
          </div>
        ) : null}

        <p className="text-center text-xs text-zinc-500">
          <Link to="/liquidity" className="text-[#C5FF41] hover:underline">
            Learn about BCC liquidity
          </Link>
          {" · "}
          <Link to="/bridge/bcc" className="text-[#F0B90B] hover:underline">
            Bridge Base ↔ BNB
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
