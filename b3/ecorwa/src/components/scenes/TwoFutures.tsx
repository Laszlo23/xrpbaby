import { useEffect, useRef, useState } from "react";
import { Coffee, Home, LampDesk, Moon, School, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

type Milestone = { year: number; headline: string; sub: string; insight: string; icon: LucideIcon };

const DECLINE: Milestone[] = [
  { year: 1, headline: "more empty homes", sub: "inventory piles quietly.", insight: "no anchor tenant — no reason to return daily.", icon: Home },
  { year: 3, headline: "fewer lights", sub: "less care · less presence.", insight: "light is a signal: when it goes, trust goes with it.", icon: Moon },
  { year: 5, headline: "café · shop gone", sub: "amenities die first.", insight: "last places to meet disappear — the square goes quiet.", icon: Coffee },
  { year: 10, headline: "school gone · families gone", sub: "collapse accelerates.", insight: "without kids, the village clock stops.", icon: School },
];

const REBUILD: Milestone[] = [
  { year: 1, headline: "coworking opens", sub: "first desks · first signal.", insight: "remote workers bring weekday rhythm + spend.", icon: LampDesk },
  { year: 3, headline: "café · circulation", sub: "money stays local.", insight: "every coffee is a vote for the street.", icon: Coffee },
  { year: 5, headline: "homes renovated", sub: "proof spreads.", insight: "one fixed façade invites the next.", icon: Home },
  { year: 10, headline: "families return", sub: "one hub rewires place.", insight: "schools need peers — the hub brings them back.", icon: Users },
];

/** Drift / regrowth pair uses Bernhardsthal Lagerhaus photography from `media` (same proof thread as Hero). */
export const TwoFutures = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const n = DECLINE.length;

  useEffect(() => {
    const compute = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.35;
      const raw = (vh * 0.5 - rect.top) / total;
      const p = Math.max(0, Math.min(1, raw));
      const s = Math.min(n - 1, Math.floor(p * n + 0.001));
      setStep(s);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [n]);

  const t = step / Math.max(1, n - 1);
  const treeScale = 0.92 + t * 0.14;
  return (
    <section
      id="two-futures"
      ref={sectionRef}
      className="relative min-h-[92vh] overflow-hidden py-12 md:py-16 bg-[radial-gradient(ellipse_at_center,_hsl(0_50%_8%/0.25),_transparent_60%),linear-gradient(180deg,hsl(0_0%_3%)_0%,hsl(0_0%_6%)_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" aria-hidden />

      <div className="container relative z-10 px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ consequence</p>
        <h2 className="font-bold uppercase leading-[0.98] tracking-tight mb-2 max-w-3xl" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
          two futures. <span className="text-acid text-glow">one village.</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mb-8 md:mb-10">
          Same place. Two rulebooks. Scroll to walk the years.
        </p>

        <div className="mx-auto mb-10 grid max-w-5xl gap-3 md:grid-cols-2 md:gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl bg-[hsl(215_22%_7%)] ring-1 ring-border/50">
            <img
              src={media.lagerhausOld}
              alt="Raiffeisen Lagerhaus Bernhardsthal — dormant warehouse"
              className="absolute inset-0 h-full w-full object-cover motion-safe:animate-ken-burns"
              style={{
                filter: `grayscale(${Math.round((1 - t) * 100)}%) contrast(1.05) brightness(${0.78 + t * 0.12})`,
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_100%,hsl(215_40%_15%/0.35),transparent_70%)]" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent transition-opacity duration-700"
              style={{ opacity: 0.75 + t * 0.15 }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,hsl(215_50%_8%/0.5),transparent_65%)]" />
            <p className="pointer-events-none absolute bottom-3 left-3 max-w-[85%] font-mono text-[9px] uppercase leading-relaxed tracking-widest text-muted-foreground">
              drift · when capital ignores place
            </p>
          </div>
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl border border-primary/20 bg-[linear-gradient(145deg,hsl(0_0%_10%/0.9),hsl(0_0%_8%)_45%,hsl(215_25%_10%)_100%)] transition-transform duration-700 ease-out"
            style={{ transform: `scale(${treeScale * 0.98})` }}
          >
            <img
              src={media.lagerhausNew}
              alt="Lagerhaus Bernhardsthal — architectural revival vision"
              className="absolute inset-0 h-full w-full object-cover motion-safe:animate-ken-burns"
              loading="lazy"
            />
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/25 blur-xl" />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(var(--primary)/0.18),transparent_55%)] transition-opacity duration-700 motion-reduce:transition-none"
              style={{ opacity: 0.2 + t * 0.35 }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" aria-hidden />
            <p className="pointer-events-none absolute bottom-3 right-3 max-w-[60%] text-right font-mono text-[9px] uppercase leading-snug tracking-widest text-primary">
              if we build · regrowth
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-5 md:space-y-6">
          {DECLINE.map((_, i) => {
            const on = i <= step;
            const d = DECLINE[i];
            const r = REBUILD[i];
            const Di = d.icon;
            const Ri = r.icon;
            return (
              <div
                key={d.year}
                className={cn(
                  "grid gap-4 rounded-xl border border-border/40 bg-background/30 p-4 backdrop-blur-sm transition-opacity duration-500 md:grid-cols-2 md:gap-6 md:p-5",
                  on ? "opacity-100 ring-1 ring-primary/15" : "opacity-40",
                )}
              >
                <div className="flex gap-3 md:gap-4">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 font-mono text-sm font-bold tabular-nums md:text-base",
                      on ? "text-muted-foreground border-destructive/30" : "text-muted-foreground/45",
                    )}
                  >
                    {d.year}y
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <Di className={cn("mt-0.5 h-5 w-5 shrink-0", on ? "text-destructive/80" : "text-muted-foreground/35")} strokeWidth={1.25} />
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide md:text-base">{d.headline}</h3>
                        <p className="text-xs text-muted-foreground md:text-sm">{d.sub}</p>
                      </div>
                    </div>
                    <p className="mt-2 border-l-2 border-destructive/35 pl-3 text-[11px] leading-relaxed text-muted-foreground md:text-xs">{d.insight}</p>
                  </div>
                </div>
                <div className="flex gap-3 border-border/35 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold tabular-nums md:text-base",
                      on ? "border-primary/40 bg-primary/10 text-primary" : "border-primary/15 text-primary/35",
                    )}
                  >
                    {r.year}y
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <Ri className={cn("mt-0.5 h-5 w-5 shrink-0", on ? "text-primary" : "text-primary/25")} strokeWidth={1.25} />
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide md:text-base">{r.headline}</h3>
                        <p className="text-xs text-muted-foreground md:text-sm">{r.sub}</p>
                      </div>
                    </div>
                    <p className="mt-2 border-l-2 border-primary/40 pl-3 text-[11px] leading-relaxed text-muted-foreground md:text-xs">{r.insight}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          year <span className="text-foreground">{DECLINE[step].year}</span> · drain vs regrowth
        </p>
      </div>
    </section>
  );
};
