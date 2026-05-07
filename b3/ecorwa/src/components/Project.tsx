import { useReveal } from "@/hooks/use-reveal";
import { media } from "@/lib/media";
import { projectHeadline, projectIntro, visionRails, whyFund } from "@/lib/project-story";
import { ArrowRight } from "lucide-react";

const sceneCards = [
  {
    key: "work",
    tag: "work here",
    caption: "Cowork · desks · fiber — in this building.",
    /** Vision interior — loft workspace & daylight (Bernhardsthal programme). */
    src: media.lagerhausCoworkingInterior,
    alt: "Lagerhaus Bernhardsthal — coworking and home-office vision (interior)",
  },
  {
    key: "stay",
    tag: "stay here",
    caption: "Short stays · guests · rhythm.",
    src: media.interior,
    alt: "Interior — architectural shell",
  },
  {
    key: "meet",
    tag: "meet here",
    caption: "Kitchen · events · gratitude forward.",
    src: media.community,
    alt: "Community gathering",
  },
] as const;

export const Project = () => {
  const ref = useReveal();

  return (
    <section id="project" ref={ref} className="relative overflow-hidden py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" aria-hidden />

      <div className="container relative z-10 px-4">
        <div className="reveal-glow mb-8 md:mb-10 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ proof</p>
          <h2 className="font-bold uppercase tracking-tight mb-3" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
            {projectHeadline}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl text-balance">{projectIntro}</p>
        </div>

        <div className="reveal-glow mb-10 grid gap-4 md:grid-cols-3">
          {whyFund.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/50 bg-background/40 px-4 py-4 backdrop-blur-sm md:px-5 md:py-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary mb-2">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="reveal-glow mb-10 space-y-4 border-y border-border/50 py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">/ vision</p>
          <ul className="grid gap-6 md:grid-cols-3 md:gap-8">
            {visionRails.map((v) => (
              <li key={v.title}>
                <p className="text-sm font-bold uppercase tracking-wide text-foreground mb-1">{v.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal-glow grid gap-4 md:grid-cols-3 md:gap-5">
          {sceneCards.map((c) => (
            <div
              key={c.key}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted/20 ring-1 ring-border/40 transition-transform duration-500 hover:scale-[1.02] hover:ring-primary/30"
            >
              <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-acid/40 bg-background/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-acid shadow-[0_0_20px_hsl(75_100%_50%/0.15)] backdrop-blur-sm">
                {c.tag}
              </div>
              <img src={c.src} alt={c.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover motion-safe:animate-ken-burns" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
              <div className="absolute inset-x-0 bottom-0 p-5 pt-12">
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground">{c.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal-glow mt-10 flex flex-wrap gap-4">
          <a href="#you-decide" className="btn-ghost-acid !py-3 !px-6 !text-xs inline-flex items-center gap-2">
            feel the split <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};
