import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ArtworkData } from "@/modules/art/data/artworks";
import { ArtworkOnchainStats } from "@/modules/art/components/web3/ArtworkOnchainStats";
import { ClientOnly } from "@/modules/art/components/web3/ClientOnly";
import { formatEur } from "@/modules/art/lib/format";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.05, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="font-display text-lg md:text-xl">{value}</dd>
    </div>
  );
}

type ArtworkChapterProps = {
  art: ArtworkData;
  reverse?: boolean;
};

export function ArtworkChapter({ art, reverse }: ArtworkChapterProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imageRef, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04]);
  const pct = art.supply > 0 ? Math.round((art.sold / art.supply) * 100) : 0;
  const moodClass = art.mood === "still" ? "exhibition-mood-still" : "exhibition-mood-volatile";

  return (
    <article
      id={`work-${art.id}`}
      className={`relative border-t hairline scroll-mt-24 ${moodClass}`}
    >
      <div className="px-6 md:px-16 pt-24 md:pt-32 pb-16 md:pb-20 max-w-[90rem] mx-auto">
        <Reveal>
          <div className={`flex flex-col gap-6 ${reverse ? "md:items-end md:text-right" : ""}`}>
            <span className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
              Work {art.edition} · {art.year}
            </span>
            <p className="font-display text-[clamp(1.25rem,3vw,2rem)] italic text-muted-foreground max-w-2xl leading-snug">
              {art.tagline}
            </p>
          </div>
        </Reveal>
      </div>

      <div ref={imageRef} className="relative px-4 md:px-16 mb-20 md:mb-28">
        <div className="relative max-w-[90rem] mx-auto aspect-[4/5] md:aspect-[16/10] overflow-hidden rounded-sm exhibition-frame">
          <motion.img
            style={{ y: imageY, scale: imageScale }}
            src={art.image}
            alt={art.title}
            className="absolute inset-0 h-[115%] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
          <div className="absolute inset-x-0 bottom-0 p-8 md:p-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/60 mb-3">
                {art.artist.name}
              </p>
              <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1.02] max-w-3xl italic">
                {art.title}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/50">
                Verified onchain
              </p>
              <p className="font-display text-2xl text-gold-gradient mt-1">
                {formatEur(art.valueEur)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
                estimated value
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 max-w-[90rem] mx-auto pb-32">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
          <div className={reverse ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5"}>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.35em] text-primary mb-6">The artist</p>
              <h3 className="font-display text-4xl md:text-5xl mb-4">{art.artist.name}</h3>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6">
                {art.artist.origin}
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">{art.artist.note}</p>
            </Reveal>
            <Reveal delay={0.12} className="mt-16">
              <p className="text-xs uppercase tracking-[0.35em] text-primary mb-4">
                Why this work matters
              </p>
              <p className="font-display text-2xl md:text-3xl leading-snug text-foreground/95">
                {art.whyItMatters}
              </p>
            </Reveal>
          </div>
          <div
            className={
              reverse
                ? "lg:col-span-6 lg:col-start-1 lg:row-start-1"
                : "lg:col-span-6 lg:col-start-7"
            }
          >
            <Reveal>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/90 font-display italic mb-10">
                {art.opening}
              </p>
            </Reveal>
            <div className="space-y-8">
              {art.story.map((paragraph, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="text-base md:text-lg text-muted-foreground leading-[1.85]">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <Reveal delay={0.1}>
          <blockquote className="my-28 md:my-40 py-16 md:py-24 border-y hairline text-center max-w-4xl mx-auto">
            <p className="font-display text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.15] italic text-balance text-gold-gradient">
              &ldquo;{art.pullQuote}&rdquo;
            </p>
          </blockquote>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 mb-24 md:mb-32">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
              Before the raffle closes
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">{art.momentBefore}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">
              How you can win the painting
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">{art.ritual}</p>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <p className="max-w-3xl text-base text-muted-foreground/90 leading-relaxed border-l-2 border-primary/40 pl-6 mb-20">
            {art.notEveryone}
          </p>
        </Reveal>

        <div
          id={`participate-${art.id}`}
          className="glass rounded-sm p-8 md:p-12 exhibition-panel scroll-mt-28"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-3">
                Raffle · Win the artwork
              </p>
              <h3 className="font-display text-3xl md:text-4xl">Enter to win this painting</h3>
              <p className="mt-3 text-sm text-muted-foreground max-w-md">
                {art.supply.toLocaleString("de-DE")} raffle tickets at {formatEur(art.priceEur)}{" "}
                each. When the edition sells out, one ticket wins the physical canvas — verifiable
                draw on Base.
              </p>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <Spec label="Medium" value={art.medium} />
              <Spec label="Dimensions" value={art.dimensions} />
              <Spec label="Value" value={formatEur(art.valueEur)} />
              <Spec label="Raffle entries" value={art.supply.toLocaleString("de-DE")} />
            </dl>
          </div>
          <ClientOnly
            fallback={
              <div className="space-y-6">
                <div className="flex justify-between text-xs uppercase tracking-[0.2em]">
                  <span className="text-muted-foreground">
                    {art.sold} of {art.supply} sold
                  </span>
                  <span className="text-primary">{pct}%</span>
                </div>
                <div className="h-[2px] bg-border/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/80 to-accent/80"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <a
                  href={`#participate-${art.id}`}
                  className="inline-block px-8 py-4 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.22em] glow-gold"
                >
                  Enter raffle · {formatEur(art.priceEur)}
                </a>
              </div>
            }
          >
            <ArtworkOnchainStats
              slug={art.id}
              fallbackPriceEur={art.priceEur}
              fallbackValueEur={art.valueEur}
              fallbackSold={art.sold}
              fallbackSupply={art.supply}
              marketingSupply={art.supply}
            />
          </ClientOnly>
        </div>
      </div>
    </article>
  );
}
