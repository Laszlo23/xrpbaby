import { Fragment } from "react";
import type { PropertyRecord } from "@/lib/properties";
import { ChevronRight } from "lucide-react";

type LiquidityLoopProps = {
  property: PropertyRecord;
};

export function LiquidityLoop({ property }: LiquidityLoopProps) {
  const { enter, hold, exit } = property.liquidity;
  const steps = [
    { key: "enter", title: "Enter", body: enter },
    { key: "hold", title: "Hold", body: hold },
    { key: "exit", title: "Exit", body: exit },
  ] as const;

  return (
    <section id="liquidity" className="relative scroll-mt-24 border-t border-border/50 py-12 md:py-16">
      <div className="container px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ liquidity</p>
        <h2 className="font-bold uppercase tracking-tight mb-10 max-w-3xl" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
          Enter · hold · exit
        </h2>

        <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-stretch md:gap-2">
          {steps.map((s, i) => (
            <Fragment key={s.key}>
              <div className="flex flex-1 flex-col md:flex-row md:items-center md:gap-2">
                <div className="flex-1 rounded-xl border border-border/50 bg-background/40 p-6 ring-1 ring-border/30">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
                {i < steps.length - 1 ? (
                  <div className="flex justify-center py-2 md:hidden" aria-hidden>
                    <ChevronRight className="h-6 w-6 rotate-90 text-primary/50" strokeWidth={1.25} />
                  </div>
                ) : null}
              </div>
              {i < steps.length - 1 ? (
                <div className="hidden shrink-0 items-center justify-center self-center md:flex" aria-hidden>
                  <ChevronRight className="h-8 w-8 text-primary/50" strokeWidth={1.25} />
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
