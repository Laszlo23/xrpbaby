import { useReveal } from "@/hooks/use-reveal";
import type { PropertyRecord } from "@/lib/properties";
import { ArrowRight } from "lucide-react";

type PropertyProjectSectionProps = {
  property: PropertyRecord;
};

export function PropertyProjectSection({ property }: PropertyProjectSectionProps) {
  const ref = useReveal();
  const gallery = property.imageGallery;
  const sceneCards = [
    {
      key: "one",
      tag: "thesis",
      caption: property.highlights[0] ?? property.thesis.slice(0, 120) + "…",
      src: encodeURI(gallery[0]?.src ?? property.imageSrc),
      alt: gallery[0]?.alt ?? property.imageAlt,
    },
    {
      key: "two",
      tag: "place",
      caption: property.highlights[1] ?? property.location,
      src: encodeURI(gallery[1]?.src ?? property.imageSrc),
      alt: gallery[1]?.alt ?? property.imageAlt,
    },
    {
      key: "three",
      tag: "proof",
      caption: property.highlights[2] ?? property.creditLines?.[0] ?? property.propertyType,
      src: encodeURI(gallery[2]?.src ?? property.imageSrc),
      alt: gallery[2]?.alt ?? property.imageAlt,
    },
  ] as const;

  return (
    <section id="project" ref={ref} className="relative overflow-hidden py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" aria-hidden />

      <div className="container relative z-10 px-4">
        <div className="reveal-glow mb-8 md:mb-10 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ story</p>
          <h2 className="font-bold uppercase tracking-tight mb-3" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
            {property.whyItMattersTitle ?? "Why this place matters"}
          </h2>
          {property.whyItMatters ? (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl text-balance whitespace-pre-line">{property.whyItMatters}</p>
          ) : null}
        </div>

        <div className="reveal-glow mb-10 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-2">/ thesis</p>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-line">{property.thesis}</p>
        </div>

        <div className="reveal-glow mb-10 grid gap-4 md:grid-cols-3">
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
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground leading-snug">{c.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal-glow flex flex-wrap gap-4">
          <a href="#docs" className="btn-ghost-acid !py-3 !px-6 !text-xs inline-flex items-center gap-2">
            documents <ArrowRight size={14} />
          </a>
          <a href="#join" className="btn-acid !py-3 !px-6 !text-xs inline-flex items-center gap-2">
            join the loop <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
