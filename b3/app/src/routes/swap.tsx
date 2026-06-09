import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MarketingShell } from "@/components/MarketingShell";
import { BccSwapPanel } from "@/components/swap/BccSwapPanel";
import { PoolStatsCard } from "@/components/liquidity/PoolStatsCard";
import { BCC_SYMBOL } from "@bc/bcc-kit";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

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

export const Route = createFileRoute("/swap")({
  head: () =>
    pageHead({
      title: `Swap ${BCC_SYMBOL} — ${BRAND_DISPLAY_NAME}`,
      description: `Buy ${BCC_SYMBOL} on Base with ETH or USDC — in-app Uniswap swap with optional card on-ramp.`,
      path: "/swap",
      keywords: ["BCC", "swap", "Uniswap", "Base", "on-ramp"],
    }),
  component: SwapPage,
});

function SwapPage() {
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
      eyebrow="On Base"
      title={`Swap for ${BCC_SYMBOL}`}
      subtitle={`Buy ${BCC_SYMBOL} with ETH or USDC via Uniswap V3 — stay in the app. Empty wallet? Add funds with a card (Privy), then swap.`}
      tone="cyan"
      articleClassName="max-w-lg"
    >
      <div className="space-y-8">
        <div className="rounded-2xl border border-[#C5FF41]/25 bg-black/40 p-5">
          <BccSwapPanel />
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
        </p>
      </div>
    </MarketingShell>
  );
}
