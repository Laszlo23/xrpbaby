import { ExternalLink, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type Props = {
  gaugeUrl: string | null;
  depositUrl: string | null;
  poolConfigured: boolean;
  poolLive?: boolean;
  enabled?: boolean;
  ownerSafe?: string;
};

export function BalancerGaugeCard({
  gaugeUrl,
  depositUrl,
  poolConfigured,
  poolLive,
  enabled,
  ownerSafe,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <div className="flex items-start gap-3">
        <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold text-white">DAO treasury pool</h3>
          <p className="mt-2 text-sm text-zinc-400">
            <strong className="text-zinc-300">Protocol:</strong> Balancer BCC/WETH pool owned by the
            multisig — swap fees + gauge incentives when funded.{" "}
            <strong className="text-zinc-300">Community:</strong> stake BPT in a Balancer gauge for
            DAO-funded rewards; Culture Power counts Aerodrome or Balancer LP.
          </p>
          {ownerSafe ? (
            <p className="mt-2 font-mono text-xs text-zinc-600">Safe owner: {ownerSafe}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm text-zinc-500">
            <li>1. Add liquidity on Balancer when the DAO pool is live</li>
            <li>2. Stake BPT in the Balancer gauge for incentive epochs</li>
            <li>3. Refresh Culture Power after LP — counts toward weekly BCC multiplier</li>
            <li>4. Governance weight: see DAO voting API (counsel-gated)</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {depositUrl ? (
              <Button variant="secondary" className="rounded-full" asChild>
                <a href={depositUrl} target="_blank" rel="noopener noreferrer">
                  {poolLive ? "Balancer pool" : "Create / seed on Balancer"}
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
            {gaugeUrl ? (
              <Button variant="outline" className="rounded-full" asChild>
                <a href={gaugeUrl} target="_blank" rel="noopener noreferrer">
                  Stake BPT (gauge) <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/roots">Culture Roots voting weight</Link>
            </Button>
          </div>
          {!poolLive && (enabled || poolConfigured) ? (
            <p className="mt-4 text-xs text-zinc-600">
              Balancer link is live in app — Safe seeds BCC + WETH, then set gauge in deploy env.
              See docs/BCC_BALANCER_LIQUIDITY.md.
            </p>
          ) : !enabled && !poolConfigured ? (
            <p className="mt-4 text-xs text-zinc-600">
              Set VITE_BCC_BALANCER_ENABLED=1 in deploy/.env — see docs/BCC_BALANCER_LIQUIDITY.md.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
