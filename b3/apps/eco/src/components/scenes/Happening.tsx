import { easeInOutCubic, useSectionScrollProgress } from "@/hooks/use-section-scroll-progress";
import { cn } from "@/lib/utils";

const SCRUB_LINES: { text: string; threshold: number; variant: "default" | "danger" | "glitch" }[] = [
  { text: "villages are not quiet.", threshold: 0.1, variant: "default" },
  { text: "they are empty.", threshold: 0.25, variant: "default" },
  { text: "this is not natural.", threshold: 0.4, variant: "glitch" },
  { text: "this is system failure.", threshold: 0.55, variant: "danger" },
];

/** No stock photography — gradient, grid, noise only */
export const Happening = () => {
  const { ref, progress } = useSectionScrollProgress<HTMLElement>();
  const strength = (t: number) => easeInOutCubic(Math.max(0, Math.min(1, (progress - t) / 0.08)));
  const bgDarken = Math.min(0.35, progress * 0.32);

  return (
    <section id="happening" ref={ref} className="relative min-h-[62vh] overflow-hidden md:min-h-[68vh]">
      {/* Absolute fill — was `sticky` + min-height in flow, which stacked ~62vh empty space above copy */}
      <div className="pointer-events-none absolute inset-0 min-h-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,hsl(73_60%_35%/0.06),transparent),linear-gradient(180deg,hsl(0_0%_4%)_0%,hsl(0_0%_7%)_50%,hsl(0_0%_4%)_100%)]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
          <defs>
            <pattern id="hg" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hg)" />
        </svg>
        <div className="absolute inset-0 bg-background transition-opacity duration-300 ease-out" style={{ opacity: bgDarken }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-noise opacity-[0.1] mix-blend-overlay" aria-hidden />
      </div>

      <div className="relative z-10 flex min-h-0 flex-col justify-start px-5 pt-8 pb-10 md:px-10 md:pt-12 md:pb-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-3 md:mb-4">
          / what’s happening
        </p>

        <div className="mx-auto max-w-3xl space-y-6 md:space-y-8">
          {SCRUB_LINES.map((line) => {
            const o = strength(line.threshold);
            const isGlitch = line.variant === "glitch";
            return (
              <p
                key={line.text}
                className={cn(
                  "font-bold uppercase leading-[1.05] tracking-tight text-foreground will-change-[opacity,transform,filter]",
                  line.variant === "danger" && "text-destructive [text-shadow:0_0_32px_hsl(var(--destructive)/0.4)]",
                  isGlitch && o > 0.02 && "motion-safe:animate-pulse",
                )}
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 3rem)",
                  opacity: o,
                  transform: `translateY(${10 * (1 - o)}px) scale(${isGlitch ? 1 + (1 - o) * 0.03 : 1})`,
                  filter: `blur(${(1 - o) * 8}px)`,
                }}
              >
                {line.text}
              </p>
            );
          })}
          <p
            className="pt-4 font-mono text-xs uppercase tracking-[0.32em] md:text-sm"
            style={{
              opacity: strength(0.7),
              transform: `translateY(${12 * (1 - strength(0.7))}px)`,
              filter: `blur(${(1 - strength(0.7)) * 6}px)`,
              color: "hsl(var(--accent))",
              textShadow: "0 0 24px hsl(var(--accent) / 0.3)",
            }}
          >
            and it’s accelerating.
          </p>
        </div>
      </div>
    </section>
  );
};
