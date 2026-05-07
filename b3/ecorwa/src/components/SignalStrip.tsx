import { heroStats } from "@/lib/stats";

/** Film-style stats bar — appears once below hero (no photos). */
export const SignalStrip = () => {
  return (
    <div className="relative border-y border-border/40 bg-background/90 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-accent/[0.05]" aria-hidden />
      <div className="container flex flex-col gap-3 px-4 py-2 md:flex-row md:items-center md:justify-center md:gap-10 md:py-3">
        <div className="text-center md:text-left">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground mb-1">structural drain</p>
          <p className="font-bold tabular-nums text-foreground text-2xl md:text-3xl tracking-tight">{heroStats.system.headline}</p>
          <p className="mt-1 max-w-xs mx-auto md:mx-0 font-mono text-[10px] leading-snug text-muted-foreground border-b border-primary/25 pb-2 inline-block">
            {heroStats.system.sub}
          </p>
        </div>
        <div className="hidden md:block h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent shrink-0" aria-hidden />
        <div className="text-center md:text-left">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground mb-1">village fabric</p>
          <p className="font-bold tabular-nums text-primary text-2xl md:text-3xl tracking-tight text-glow">{heroStats.buildings.headline}</p>
          <p className="mt-1 max-w-xs mx-auto md:mx-0 font-mono text-[10px] leading-snug text-muted-foreground border-b border-primary/30 pb-2 inline-block">
            {heroStats.buildings.sub}
          </p>
        </div>
      </div>
    </div>
  );
};
