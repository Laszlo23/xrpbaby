import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONE_RING: Record<
  NonNullable<MarketingHeroProps["tone"]>,
  { wash: string; orb: string; eyebrow: string }
> = {
  purple: {
    wash: "from-[rgb(0_24_80/0.5)] via-black/75 to-black",
    orb: "bg-[radial-gradient(circle_at_30%_20%,rgb(0_82_255/0.24),transparent_55%)]",
    eyebrow: "text-zinc-500",
  },
  amber: {
    wash: "from-[rgb(80_40_10/0.45)] via-black/78 to-black",
    orb: "bg-[radial-gradient(circle_at_70%_30%,rgb(251_191_36/0.18),transparent_50%)]",
    eyebrow: "text-amber-200/70",
  },
  rose: {
    wash: "from-[rgb(60_15_40/0.5)] via-black/76 to-black",
    orb: "bg-[radial-gradient(circle_at_40%_60%,rgb(251_113_133/0.15),transparent_52%)]",
    eyebrow: "text-rose-200/65",
  },
  cyan: {
    wash: "from-[rgb(8_40_45/0.45)] via-black/78 to-black",
    orb: "bg-[radial-gradient(circle_at_80%_40%,rgb(34_211_238/0.14),transparent_48%)]",
    eyebrow: "text-cyan-200/65",
  },
  slate: {
    wash: "from-zinc-900/90 via-black to-black",
    orb: "bg-[radial-gradient(circle_at_50%_0%,rgb(113_113_122/0.12),transparent_45%)]",
    eyebrow: "text-zinc-500",
  },
};

export type MarketingHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  tone?: "purple" | "amber" | "rose" | "cyan" | "slate";
  size?: "hero" | "compact";
};

export function MarketingHero({
  eyebrow,
  title,
  subtitle,
  actions,
  tone = "purple",
  size = "hero",
}: MarketingHeroProps) {
  const t = TONE_RING[tone];

  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-white/[0.07]",
        size === "hero" ? "py-14 md:py-20" : "py-10 md:py-12",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", t.wash)} />
      <div className={cn("pointer-events-none absolute inset-0 opacity-90", t.orb)} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-[1] mx-auto max-w-3xl px-4 md:px-8">
        {eyebrow ? (
          <p className={cn("font-mono text-[11px] uppercase tracking-[0.32em]", t.eyebrow)}>
            {eyebrow}
          </p>
        ) : null}
        <div
          className={cn(
            "font-heading font-bold tracking-tight text-white text-balance",
            size === "hero"
              ? "mt-4 text-3xl leading-[1.08] md:text-4xl lg:text-[2.75rem]"
              : "mt-3 text-2xl md:text-3xl",
          )}
        >
          {title}
        </div>
        {subtitle ? (
          <p
            className={cn(
              "max-w-2xl text-pretty text-zinc-400",
              size === "hero"
                ? "mt-5 text-base leading-relaxed md:text-lg"
                : "mt-3 text-sm leading-relaxed md:text-base",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {actions ? (
          <div className={cn("flex flex-wrap gap-3", size === "hero" ? "mt-8" : "mt-6")}>
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
