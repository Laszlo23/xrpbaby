import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DisclaimerBanner } from "@/components/investors/DisclaimerBanner";

function fmtUsdM(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  const usd = n * 1_000_000;
  if (n >= 100) return `~$${Math.round(n)}M`;
  if (n >= 10) return `~$${n.toFixed(1)}M`;
  if (n >= 1) return `~$${n.toFixed(2)}M`;
  if (usd >= 1000) return `~$${Math.round(usd).toLocaleString("en-US")}`;
  if (usd >= 1) return `~$${usd.toFixed(0)}`;
  return `~$${usd.toFixed(2)}`;
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 10) / 10}%`;
}

/** Private advisor sandbox — sliders start at zero; user must deliberately set inputs. */
export function RoiScenarioExplorer() {
  const [raiseM, setRaiseM] = useState(0);
  const [postMoneyM, setPostMoneyM] = useState(0);
  const [monthlyGmvM, setMonthlyGmvM] = useState(0);
  const [takeRatePct, setTakeRatePct] = useState(10);

  const ownershipSold = useMemo(() => {
    if (postMoneyM <= 0 || raiseM <= 0) return null;
    return Math.min(100, (raiseM / postMoneyM) * 100);
  }, [raiseM, postMoneyM]);

  const raiseExceedsPostMoney = raiseM > 0 && postMoneyM > 0 && raiseM > postMoneyM;

  const illustrativeAnnualFeeRevenue = useMemo(() => {
    if (monthlyGmvM <= 0) return null;
    const annualGmvM = monthlyGmvM * 12;
    return (annualGmvM * takeRatePct) / 100;
  }, [monthlyGmvM, takeRatePct]);

  const inputsUnset = raiseM <= 0 && postMoneyM <= 0 && monthlyGmvM <= 0;

  return (
    <div className="space-y-6">
      <DisclaimerBanner dense />

      <div className="rounded-3xl border border-white/[0.08] bg-black/30 p-6 md:p-8">
        <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
          Advisor scenario sandbox
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Sliders default to <strong className="font-medium text-zinc-300">zero</strong> — drag only
          when modeling a hypothetical conversation. Nothing here reflects a live round, signed term
          sheet, or public ask on buildingcultureid.space.
        </p>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Hypothetical raise ($M)</Label>
                <span className="font-mono text-sm text-zinc-300">
                  {raiseM > 0 ? fmtUsdM(raiseM) : "— (unset)"}
                </span>
              </div>
              <Slider
                value={[raiseM]}
                onValueChange={(v) => setRaiseM(v[0] ?? 0)}
                min={0}
                max={20}
                step={0.25}
                className="mt-3"
              />
              <p className="mt-1 text-xs text-zinc-600">$0 – $20M · deck ask is not auto-filled</p>
            </div>

            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Hypothetical post-money ($M)</Label>
                <span className="font-mono text-sm text-zinc-300">
                  {postMoneyM > 0 ? fmtUsdM(postMoneyM) : "— (unset)"}
                </span>
              </div>
              <Slider
                value={[postMoneyM]}
                onValueChange={(v) => setPostMoneyM(v[0] ?? 0)}
                min={0}
                max={80}
                step={1}
                className="mt-3"
              />
              <p className="mt-1 text-xs text-zinc-600">
                Coarse cap-table slice math only — excludes pools and prior rounds.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Monthly GMV proxy ($M)</Label>
                <span className="font-mono text-sm text-zinc-300">
                  {monthlyGmvM > 0 ? fmtUsdM(monthlyGmvM) : "— (unset)"}
                </span>
              </div>
              <Slider
                value={[monthlyGmvM]}
                onValueChange={(v) => setMonthlyGmvM(v[0] ?? 0)}
                min={0}
                max={25}
                step={0.01}
                className="mt-3"
              />
              <p className="mt-1 text-xs text-zinc-600">
                Compare to live DEX volume on{" "}
                <a href="/investors" className="text-zinc-400 underline underline-offset-4">
                  /investors
                </a>{" "}
                — not platform revenue.
              </p>
            </div>

            <div>
              <div className="flex justify-between gap-4">
                <Label className="text-zinc-400">Assumed take rate</Label>
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
              Ownership sold (if both set)
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-white">
              {ownershipSold == null ? "—" : fmtPct(ownershipSold)}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              raise ÷ post-money — toy math only.
              {raiseExceedsPostMoney ? (
                <span className="mt-1 block text-amber-200/80">
                  Raise exceeds post-money — adjust inputs.
                </span>
              ) : null}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Illustrative annual fee revenue
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-emerald-200/95">
              {illustrativeAnnualFeeRevenue == null ? "—" : fmtUsdM(illustrativeAnnualFeeRevenue)}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Monthly GMV × 12 × take rate. Not profit; excludes costs and volatility.
            </p>
          </div>
        </div>

        {inputsUnset ? (
          <p className="mt-6 text-center text-xs text-zinc-600">
            All scenario inputs unset — move a slider to explore a private what-if.
          </p>
        ) : null}
      </div>
    </div>
  );
}
