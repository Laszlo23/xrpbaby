import { ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type Props = {
  gaugeUrl: string | null;
  poolConfigured: boolean;
  poolLive?: boolean;
  enabled?: boolean;
  tradingAgentReachable?: boolean;
  quoteBccUrl?: string;
};

export function AerodromeGaugeCard({
  gaugeUrl,
  poolConfigured,
  poolLive,
  enabled,
  tradingAgentReachable,
  quoteBccUrl,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <div className="flex items-start gap-3">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold text-white">Hybrid rewards</h3>
          <p className="mt-2 text-sm text-zinc-400">
            <strong className="text-zinc-300">Protocol:</strong> Aerodrome trading fees + gauge AERO
            when the pool is incentivized. <strong className="text-zinc-300">Community:</strong>{" "}
            Culture Points for finishing this learn track and optional LP proof — education first,
            not guaranteed returns.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-500">
            <li>1. Complete the lesson track on this page</li>
            <li>2. Add liquidity on Uniswap or Aerodrome when ready</li>
            <li>3. Stake LP in an Aerodrome gauge for AERO emissions (if incentivized)</li>
            <li>4. Claim Culture Points with your wallet below</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {gaugeUrl ? (
              <Button variant="secondary" className="rounded-full" asChild>
                <a href={gaugeUrl} target="_blank" rel="noopener noreferrer">
                  Open Aerodrome gauge <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/trading-agent">Trading agent (x402)</Link>
            </Button>
            {quoteBccUrl && tradingAgentReachable ? (
              <Button variant="outline" className="rounded-full" asChild>
                <a href={quoteBccUrl} target="_blank" rel="noopener noreferrer">
                  Live BCC quote
                </a>
              </Button>
            ) : null}
          </div>
          {!poolLive && (enabled || poolConfigured) ? (
            <p className="mt-4 text-xs text-zinc-600">
              Pool link is live in app — seed BCC + WETH on Aerodrome, then set gauge address in
              deploy env. See docs/BCC_AERODROME_LIQUIDITY.md.
            </p>
          ) : !enabled && !poolConfigured ? (
            <p className="mt-4 text-xs text-zinc-600">
              Set VITE_BCC_AERODROME_ENABLED=1 in deploy/.env — see docs/BCC_AERODROME_LIQUIDITY.md.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
