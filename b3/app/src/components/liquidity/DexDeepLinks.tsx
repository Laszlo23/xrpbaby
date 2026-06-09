import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLiquidityDexLinks } from "@/lib/liquidity-config";

type AerodromeMeta = {
  enabled?: boolean;
  poolConfigured: boolean;
  poolLive?: boolean;
  depositUrl: string | null;
  gaugeUrl: string | null;
  swapUrl?: string | null;
  routing: string;
};

export function DexDeepLinks({ aerodrome }: { aerodrome: AerodromeMeta }) {
  const links = buildLiquidityDexLinks();
  const aeroDeposit = aerodrome.depositUrl ?? links.aerodromeDeposit;
  const aeroGauge = aerodrome.gaugeUrl ?? links.aerodromeGauge;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Primary</p>
        <h3 className="mt-2 font-heading text-lg font-semibold text-white">Uniswap V3</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Main BCC liquidity on Base — swap in-app or add concentrated liquidity on Uniswap.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" className="rounded-full" asChild>
            <Link to="/swap">Swap BCC in-app</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <a href={links.uniswapSwap} target="_blank" rel="noopener noreferrer">
              Uniswap <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <a href={links.uniswapPool} target="_blank" rel="noopener noreferrer">
              Explore pools
            </a>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-neon/20 bg-neon/[0.03] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon/80">Secondary</p>
        <h3 className="mt-2 font-heading text-lg font-semibold text-white">Aerodrome</h3>
        <p className="mt-2 text-sm text-zinc-400">
          {aerodrome.poolLive || aerodrome.routing === "aerodrome"
            ? "BCC/WETH on Aerodrome — deposit LP, then stake in a gauge for AERO when incentivized."
            : aerodrome.enabled || aerodrome.poolConfigured
              ? "BCC/WETH pair is configured — open Aerodrome to create or seed the pool (treasury step)."
              : "Enable Aerodrome in deploy env to show the BCC/WETH deposit link."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {aeroDeposit ? (
            <Button variant="secondary" className="rounded-full" asChild>
              <a href={aeroDeposit} target="_blank" rel="noopener noreferrer">
                {aerodrome.poolLive ? "Add liquidity" : "Open BCC/WETH on Aerodrome"}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="rounded-full" disabled>
              Pool not configured yet
            </Button>
          )}
          {aeroGauge ? (
            <Button variant="outline" className="rounded-full" asChild>
              <a href={aeroGauge} target="_blank" rel="noopener noreferrer">
                Stake LP (gauge)
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
