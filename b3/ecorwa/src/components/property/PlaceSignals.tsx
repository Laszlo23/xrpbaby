import type { PropertyRecord } from "@/lib/properties";
import { formatPropertyValueEur, getEstimatedYieldPercent } from "@/lib/property-format";

type PlaceSignalsProps = {
  property: PropertyRecord;
};

export function PlaceSignals({ property }: PlaceSignalsProps) {
  const share = property.pricing.sharePriceEur;
  const yieldPct = getEstimatedYieldPercent(property);

  return (
    <section className="relative border-t border-border/50 py-12 md:py-16">
      <div className="container px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-8">/ signals</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-background/40 p-6 ring-1 ring-border/30">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Cheap to enter</p>
            <p className="font-mono text-3xl font-bold tabular-nums text-acid md:text-4xl">~€{share.toLocaleString("en-US")}</p>
            <p className="mt-2 text-xs text-muted-foreground">per share (illustrative)</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-6 ring-1 ring-border/30">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Whole-asset reference</p>
            <p className="font-mono text-3xl font-bold tabular-nums text-acid md:text-4xl">{formatPropertyValueEur(property)}</p>
            <p className="mt-2 text-xs text-muted-foreground">reference value (UI label)</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-6 ring-1 ring-border/30">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Yield band</p>
            <p className="font-mono text-3xl font-bold tabular-nums text-acid md:text-4xl">{yieldPct.toFixed(1)}%</p>
            <p className="mt-2 text-xs text-muted-foreground">gross rent ÷ reference (indicative)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
