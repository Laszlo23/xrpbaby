import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";

function fmtUsdM(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n >= 100) return `~$${Math.round(n)}M`;
  if (n >= 10) return `~$${n.toFixed(1)}M`;
  return `~$${n.toFixed(2)}M`;
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 10) / 10}%`;
}

/**
 * Toy calculator — rounded, labeled illustrative only.
 * Not a forecast; not financial advice.
 */
export function RoiScenarioExplorer() {
  const [raiseM, setRaiseM] = useState(2);
  const [postMoneyM, setPostMoneyM] = useState(18);
  const [monthlyGmvM, setMonthlyGmvM] = useState(1.5);
  const [takeRatePct, setTakeRatePct] = useState(12);

  const ownershipSold = useMemo(() => {
    if (postMoneyM <= 0 || raiseM <= 0) return 0;
    return Math.min(100, (raiseM / postMoneyM) * 100);
  }, [raiseM, postMoneyM]);

  const raiseExceedsPostMoney = raiseM > postMoneyM;

  const illustrativeAnnualFeeRevenue = useMemo(() => {
    const annualGmvM = monthlyGmvM * 12;
    return (annualGmvM * takeRatePct) / 100;
  }, [monthlyGmvM, takeRatePct]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner dense />

      <div className="rounded-3xl border border-white/[0.08] bg-black/30 p-6 md:p-8">
        <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
          Illustrative scenario (toy model)
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Drag sliders to stress-test <strong className="font-medium text-zinc-300">stories</strong>
          , not precision. Outputs are rounded bands for conversation with advisors—not projections.
        </p>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Round size (raise)</Label>
                <span className="font-mono text-sm text-zinc-300">{fmtUsdM(raiseM)}</span>
              </div>
              <Slider
                value={[raiseM]}
                onValueChange={(v) => setRaiseM(v[0] ?? 0)}
                min={0.25}
                max={20}
                step={0.25}
                className="mt-3"
              />
              <p className="mt-1 text-xs text-zinc-600">$0.25M – $20M</p>
            </div>

            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Post-money valuation (placeholder)</Label>
                <span className="font-mono text-sm text-zinc-300">{fmtUsdM(postMoneyM)}</span>
              </div>
              <Slider
                value={[postMoneyM]}
                onValueChange={(v) => setPostMoneyM(v[0] ?? 1)}
                min={5}
                max={80}
                step={1}
                className="mt-3"
              />
              <p className="mt-1 text-xs text-zinc-600">
                Used only for a coarse “slice of the cap table” story if this round were primary.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Monthly GMV proxy ($M)</Label>
                <span className="font-mono text-sm text-zinc-300">{fmtUsdM(monthlyGmvM)}</span>
              </div>
              <Slider
                value={[monthlyGmvM]}
                onValueChange={(v) => setMonthlyGmvM(v[0] ?? 0)}
                min={0.1}
                max={25}
                step={0.1}
                className="mt-3"
              />
            </div>

            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Assumed platform take rate</Label>
                <span className="font-mono text-sm text-zinc-300">{fmtPct(takeRatePct)}</span>
              </div>
              <Slider
                value={[takeRatePct]}
                onValueChange={(v) => setTakeRatePct(v[0] ?? 0)}
                min={1}
                max={35}
                step={1}
                className="mt-3"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Indicative ownership sold (toy)
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-white">
              {fmtPct(ownershipSold)}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              raise ÷ post-money — simplified; excludes option pools and prior rounds.
              {raiseExceedsPostMoney ? (
                <span className="mt-1 block text-amber-200/80">
                  Toy inputs: raise larger than post-money — adjust sliders for a coherent story.
                </span>
              ) : null}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Illustrative annual fee revenue
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-emerald-200/95">
              {fmtUsdM(illustrativeAnnualFeeRevenue)}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              (Monthly GMV proxy × 12 × take rate). Not profit; excludes infra, grants, and
              volatility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
