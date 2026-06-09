import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MarketingShell } from "@/components/MarketingShell";
import { AerodromeGaugeCard } from "@/components/liquidity/AerodromeGaugeCard";
import { DexDeepLinks } from "@/components/liquidity/DexDeepLinks";
import {
  LiquidityLearnTrack,
  liquidityLessonsAllComplete,
} from "@/components/liquidity/LiquidityLearnTrack";
import { PoolStatsCard } from "@/components/liquidity/PoolStatsCard";
import { Button } from "@/components/ui/button";
import { useBcdEconomy } from "@/contexts/BcdEconomyContext";
import { postCompleteTaskWithSiwe } from "@/lib/points-fns";
import { pageHead } from "@/lib/seo";
import { useServerFn } from "@tanstack/react-start";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
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
  aerodrome: {
    enabled: boolean;
    poolConfigured: boolean;
    poolLive: boolean;
    depositUrl: string | null;
    gaugeUrl: string | null;
    routing: string;
  };
  redemption: {
    percentToGate: number | null;
    minPoolTvlUsd: number;
    ready: boolean;
  };
  tradingAgentReachable?: boolean;
  quoteBccUrl?: string;
};

export const Route = createFileRoute("/liquidity")({
  head: () =>
    pageHead({
      title: `Learn liquidity — ${BRAND_DISPLAY_NAME}`,
      description:
        "Learn how BCC liquidity works on Base — Uniswap primary, Aerodrome secondary, Culture Points for education, gauge staking for protocol rewards.",
      path: "/liquidity",
      keywords: ["BCC", "liquidity", "Aerodrome", "Uniswap", "Base", "Culture Points"],
    }),
  component: LiquidityPage,
});

function LiquidityPage() {
  const { isConnected } = useAccount();
  const { openGetBcd } = useBcdEconomy();
  const { signSiwe } = usePointsSiweSign();
  const completeTask = useServerFn(postCompleteTaskWithSiwe);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [lessonsReady, setLessonsReady] = useState(() => liquidityLessonsAllComplete());

  const { data, isLoading } = useQuery({
    queryKey: ["market", "bcc"],
    queryFn: async () => {
      const res = await fetch("/api/market/bcc");
      if (!res.ok) throw new Error("market_bcc_failed");
      return (await res.json()) as BccMarketResponse;
    },
    staleTime: 60_000,
  });

  async function claimTask(taskSlug: string, requireLessons?: boolean) {
    if (requireLessons && !liquidityLessonsAllComplete()) {
      toast.error("Finish all lesson steps first");
      return;
    }
    setClaiming(taskSlug);
    try {
      const signed = await signSiwe();
      if (!signed) return;
      const res = await completeTask({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not record points");
        return;
      }
      toast.success(res.alreadyCompleted ? "Already credited" : "Culture Points recorded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setClaiming(null);
    }
  }

  return (
    <MarketingShell
      eyebrow="BCC · Base"
      title="Learn BCC liquidity"
      subtitle="Understand pools on Base, add liquidity on Uniswap or Aerodrome, and earn Culture Points for learning — plus protocol rewards when gauges are live."
    >
      <div className="mx-auto max-w-4xl space-y-10 px-4 pb-16 pt-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <PoolStatsCard
            loading={isLoading}
            stats={
              data
                ? {
                    combinedLiquidityUsd: data.combinedLiquidityUsd,
                    pools: data.pools,
                    redemption: data.redemption,
                  }
                : null
            }
          />
          <div className="flex flex-col justify-center gap-3 rounded-2xl border border-white/10 p-6">
            <p className="text-sm text-zinc-400">
              BCC powers discounts across the culture economy. Deeper liquidity helps everyone swap
              and participate — start by learning, then add LP when you are comfortable.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="rounded-full" asChild>
                <Link to="/swap">Swap BCC in-app</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={openGetBcd}
              >
                Get BCD
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/mission">Mission & token</Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/tg">Telegram learn modules</Link>
              </Button>
            </div>
          </div>
        </div>

        <LiquidityLearnTrack onAllComplete={() => setLessonsReady(true)} />

        <DexDeepLinks
          aerodrome={
            data?.aerodrome ?? {
              enabled: false,
              poolConfigured: false,
              poolLive: false,
              depositUrl: null,
              gaugeUrl: null,
              routing: "uniswap_fallback",
            }
          }
        />

        <AerodromeGaugeCard
          gaugeUrl={data?.aerodrome.gaugeUrl ?? null}
          poolConfigured={data?.aerodrome.poolConfigured ?? false}
          poolLive={data?.aerodrome.poolLive ?? false}
          enabled={data?.aerodrome.enabled ?? false}
          tradingAgentReachable={data?.tradingAgentReachable}
          quoteBccUrl={data?.quoteBccUrl}
        />

        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-white">Culture Points quests</h3>
          <p className="text-sm text-zinc-400">
            Connect wallet, complete lessons, then sign once per quest. LP proof awards points when
            you hold Aerodrome LP tokens (if pool is configured).
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full"
              disabled={!isConnected || claiming != null}
              onClick={() => void claimTask("visit-liquidity-hub")}
            >
              {claiming === "visit-liquidity-hub" ? "Signing…" : "Visit hub (+20)"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              disabled={!isConnected || claiming != null || !lessonsReady}
              onClick={() => void claimTask("complete-bcc-liquidity-lesson", true)}
            >
              {claiming === "complete-bcc-liquidity-lesson" ? "Signing…" : "Lessons complete (+40)"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!isConnected || claiming != null}
              onClick={() => void claimTask("bcc-lp-proof")}
            >
              {claiming === "bcc-lp-proof" ? "Checking LP…" : "LP proof (+75)"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] px-4 py-3 text-sm text-zinc-500">
          <span>Property-share liquidity lives on Places — different from BCC token pools.</span>
          <Button variant="link" className="h-auto p-0 text-neon" asChild>
            <a
              href="https://places.buildingcultureid.space/invest"
              target="_blank"
              rel="noopener noreferrer"
            >
              Places invest <ArrowRight className="ml-1 inline h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </MarketingShell>
  );
}
