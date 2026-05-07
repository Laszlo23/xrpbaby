import { useState } from "react";
import { Baby, Briefcase, Coffee, Hammer, Home, Leaf, Users, Wifi } from "lucide-react";
import { useSectionScrollProgress, easeInOutCubic } from "@/hooks/use-section-scroll-progress";
import { cn } from "@/lib/utils";

const nodes: { id: string; label: string; story: string; villageChange: string; icon: typeof Home; angle: number }[] = [
  {
    id: "hub",
    label: "one hub",
    story: "A shared front door for work, food, and guests.",
    villageChange: "Turns an empty landmark into daily reasons to show up.",
    icon: Home,
    angle: 0,
  },
  {
    id: "remote",
    label: "remote",
    story: "Work where the building — not the landlord — is the amenity.",
    villageChange: "Weekday foot traffic where there used to be none.",
    icon: Wifi,
    angle: 52,
  },
  {
    id: "cafe",
    label: "café",
    story: "A till that belongs to the place.",
    villageChange: "Spend circulates: suppliers, shifts, repairs stay nearby.",
    icon: Coffee,
    angle: 104,
  },
  {
    id: "jobs",
    label: "jobs",
    story: "Trades on site: renovation, ops, events.",
    villageChange: "Skills anchor locally instead of commuting out.",
    icon: Briefcase,
    angle: 156,
  },
  {
    id: "homes",
    label: "homes",
    story: "Proof that stone can be shelter again.",
    villageChange: "Neighbours copy what they can see working.",
    icon: Hammer,
    angle: 208,
  },
  {
    id: "families",
    label: "families",
    story: "Schools and clubs need peers.",
    villageChange: "Kids need friends — the hub helps families risk staying.",
    icon: Baby,
    angle: 260,
  },
  {
    id: "movement",
    label: "scale",
    story: "A playbook that travels town to town.",
    villageChange: "Each hub teaches the next — culture compounds.",
    icon: Users,
    angle: 312,
  },
];

export const Ripple = () => {
  /** Higher focus + remap: raw progress stays low while the tall section scrolls, so icons used to finish only after the diagram left the viewport. */
  const { ref, progress: scrollProgress } = useSectionScrollProgress<HTMLElement>({ focus: 0.68 });
  const progress = Math.min(1, scrollProgress * 2.85);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const radius = 40;

  const lineReach = (i: number) => {
    const start = 0.05 + i * 0.045;
    return easeInOutCubic(Math.max(0, Math.min(1, (progress - start) / 0.085)));
  };

  const nodePop = (i: number) => {
    const start = 0.06 + i * 0.04;
    return easeInOutCubic(Math.max(0, Math.min(1, (progress - start) / 0.075)));
  };

  const hub = nodes[0];

  return (
    <section id="ripple" ref={ref} className="relative overflow-hidden py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,hsl(75_45%_42%/0.12),transparent_55%),radial-gradient(ellipse_at_center,hsl(215_30%_20%/0.08),transparent_65%)]" />

      <div className="container relative z-10 px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ ripple</p>
          <h2 className="font-bold uppercase leading-[0.95] tracking-tight" style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}>
            one hub · <span className="text-acid text-glow">many loops.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground md:text-base text-balance">
            Not a wiring diagram — a rhythm. One building orchestrates spend, work, and care so the village feels alive again.
          </p>
        </div>

        <div className="relative mx-auto mb-12 aspect-square max-w-[min(100%,480px)] md:max-w-[520px]">
          <div className="pointer-events-none absolute inset-[8%] rounded-[45%] bg-[radial-gradient(circle,hsl(75_50%_45%/0.08),transparent_70%)] blur-2xl" aria-hidden />

          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-primary/25" aria-hidden>
            <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.08" opacity="0.4" />
            <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="0.06" opacity="0.28" />
            {nodes.slice(1).map((n, i) => {
              const rad = ((n.angle - 90) * Math.PI) / 180;
              const x2 = 50 + radius * Math.cos(rad);
              const y2 = 50 + radius * Math.sin(rad);
              const reach = lineReach(i);
              return (
                <line
                  key={n.id}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--primary) / 0.35)"
                  strokeWidth="0.1"
                  strokeLinecap="round"
                  style={{ opacity: 0.12 + reach * 0.5 }}
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 z-10 flex h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.75rem] border border-primary/35 bg-gradient-to-b from-background/95 to-background/80 shadow-[0_12px_40px_hsl(var(--primary)/0.15)] backdrop-blur-md md:h-28 md:w-28">
            <Home className="mb-1 h-9 w-9 text-primary md:h-10 md:w-10" strokeWidth={1.1} aria-hidden />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{hub.label}</span>
          </div>

          {nodes.slice(1).map((n, i) => {
            const rad = ((n.angle - 90) * Math.PI) / 180;
            const x = 50 + (radius + 5) * Math.cos(rad);
            const y = 50 + (radius + 5) * Math.sin(rad);
            const Icon = n.icon;
            const pop = nodePop(i);
            const glowing = hoverId === n.id;
            return (
              <button
                type="button"
                key={n.id}
                className="absolute flex flex-col items-center gap-1 rounded-xl border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  opacity: pop,
                  transform: `translate(-50%, -50%) scale(${0.5 + pop * 0.5})`,
                  transition: "opacity 0.4s ease, transform 0.45s ease",
                }}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(n.id)}
                onBlur={() => setHoverId(null)}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 cursor-default items-center justify-center rounded-2xl border bg-card/85 shadow-md backdrop-blur-sm transition-all duration-300 md:h-11 md:w-11",
                    glowing ? "scale-105 border-primary/55 shadow-[0_0_24px_hsl(var(--primary)/0.35)]" : "border-primary/25",
                  )}
                >
                  <Icon className="h-[1.15rem] w-[1.15rem] text-primary md:h-5 md:w-5" strokeWidth={1.2} />
                </span>
                <span className="max-w-[5rem] text-center font-mono text-[7px] uppercase leading-tight tracking-wider text-muted-foreground md:max-w-[6rem] md:text-[8px]">
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.slice(1).map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/30"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{n.label}</span>
                </div>
                <p className="text-sm font-medium leading-snug text-foreground">{n.story}</p>
                <p className="mt-2 flex items-start gap-2 border-t border-border/40 pt-2 text-xs leading-relaxed text-muted-foreground">
                  <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
                  <span>{n.villageChange}</span>
                </p>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          proof compounds in place
        </p>
      </div>
    </section>
  );
};
