import { useCallback, type MutableRefObject } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { useParallaxLayer } from "@/hooks/use-parallax-layer";
import { useCountUp } from "@/hooks/use-count-up";
import { useSectionScrollProgress } from "@/hooks/use-section-scroll-progress";
import { movementStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

const quotes = [
  { id: "lena", name: "Lena", flag: "🇦🇹", q: "Own something real." },
  { id: "marco", name: "Marco", flag: "🇩🇪", q: "Money finally belongs somewhere." },
  { id: "sara", name: "Sara", flag: "🇵🇹", q: "I joined, didn’t “invest.”" },
  { id: "tomas", name: "Tomáš", flag: "🇨🇿", q: "The village breathes again." },
];

const MAP_DOTS = [
  { x: 22, y: 38 },
  { x: 42, y: 26 },
  { x: 58, y: 54 },
  { x: 74, y: 34 },
];

export const Community = () => {
  const revealRef = useReveal();
  const parallaxWash = useParallaxLayer(0.12);
  const { ref: progRef, progress } = useSectionScrollProgress<HTMLElement>({ focus: 0.48 });
  const countOn = progress > 0.12;

  const buildersN = useCountUp(movementStats.builders, 1200, countOn);
  const countriesN = useCountUp(movementStats.countries, 1000, countOn);

  const sectionRef = useCallback(
    (node: HTMLElement | null) => {
      (revealRef as MutableRefObject<HTMLElement | null>).current = node;
      (progRef as MutableRefObject<HTMLElement | null>).current = node;
    },
    [progRef, revealRef],
  );

  return (
    <section id="builders" ref={sectionRef} className="relative overflow-hidden py-14 md:py-16">
      <div
        ref={parallaxWash}
        className="parallax-layer pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-primary/[0.04] will-change-transform"
        aria-hidden
      />

      <div className="container relative z-10 px-4">
        <div className="reveal-glow mb-8 md:mb-10 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-2">/ builders</p>
          <h2 className="font-bold uppercase tracking-tight" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
            movement on the map.
          </h2>
        </div>

        <div className="reveal-glow mb-10 flex flex-wrap gap-4 md:gap-6">
          <div className="rounded-xl px-4 py-3 backdrop-blur-sm bg-card/30 ring-1 ring-primary/20">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">live</p>
            <p className="text-2xl font-bold tabular-nums text-primary">{buildersN.toLocaleString()}</p>
          </div>
          <div className="rounded-xl px-4 py-3 backdrop-blur-sm bg-card/20 ring-1 ring-border/50">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">countries</p>
            <p className="text-2xl font-bold tabular-nums">{countriesN}</p>
          </div>

          <div className="relative hidden sm:block h-[72px] w-[72px] shrink-0 rounded-xl ring-1 ring-primary/15 bg-card/20 overflow-hidden">
            <svg viewBox="0 0 100 100" className="absolute inset-1 text-primary/70" aria-hidden>
              {MAP_DOTS.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={2}
                  fill="currentColor"
                  style={{
                    opacity: countOn ? 1 : 0.25,
                    filter: countOn ? "drop-shadow(0 0 4px hsl(var(--primary)))" : "none",
                  }}
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quotes.map((q, i) => (
            <div
              key={q.id}
              className={cn(
                "reveal-glow rounded-xl p-5 backdrop-blur-sm bg-card/25 ring-1 ring-border/40 transition-transform duration-300 hover:ring-primary/25 hover:bg-card/35",
              )}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-lg" aria-hidden>
                  {q.flag}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{q.name}</span>
              </div>
              <p className="text-sm leading-snug text-foreground/95">&ldquo;{q.q}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
