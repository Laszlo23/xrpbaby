import type { PropertyRecord } from "@/lib/properties";

type PropertyHeroProps = {
  property: PropertyRecord;
};

export function PropertyHero({ property }: PropertyHeroProps) {
  const cover = encodeURI(property.imageSrc);
  const { coOwnersTarget, sharePriceEur } = property.pricing;

  return (
    <section id="top" className="relative min-h-[78vh] overflow-hidden md:min-h-[85vh]">
      <div className="absolute inset-0">
        <img src={cover} alt={property.imageAlt} className="h-full w-full object-cover motion-safe:animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/25" aria-hidden />
        <div className="absolute inset-0 bg-noise opacity-[0.06] mix-blend-overlay" aria-hidden />
      </div>
      <div className="relative z-10 flex min-h-[78vh] flex-col justify-end px-4 pb-16 pt-28 md:min-h-[85vh] md:pb-24 md:pt-32">
        <div className="container mx-auto max-w-4xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary mb-3">{property.location}</p>
          <h1 className="font-bold uppercase leading-[0.95] tracking-tight text-balance mb-4" style={{ fontSize: "clamp(1.85rem, 5vw, 3.25rem)" }}>
            {property.headline}
          </h1>
          {property.emotionalHero ? (
            <p className="max-w-2xl text-base text-muted-foreground leading-relaxed md:text-lg">{property.emotionalHero}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="inline-flex rounded-full border border-primary/35 bg-background/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground backdrop-blur-sm">
              owned by {coOwnersTarget.toLocaleString("en-US")} humans · €{sharePriceEur.toLocaleString("en-US")} / share
            </p>
            {property.archived ? (
              <p className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-primary">
                Archive · orientation only
              </p>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#own" className="btn-ghost-acid !py-3 !px-5 !text-xs">
              Ownership
            </a>
            <a href="#docs" className="btn-acid !py-3 !px-5 !text-xs">
              Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
