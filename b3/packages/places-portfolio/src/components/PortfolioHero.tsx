import type { PortfolioHeroProps } from "../types.js";
import { PortfolioImage } from "./PortfolioImage.js";
import { resolveLink } from "./link.js";

export function PortfolioHero({ heroImageUrl, flagshipHref, LinkComponent }: PortfolioHeroProps) {
  const Link = resolveLink(LinkComponent);

  return (
    <section className="relative flex min-h-[min(720px,calc(100dvh-4rem))] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <div className="absolute inset-0 z-0">
        <PortfolioImage
          src={heroImageUrl}
          alt="Building Culture Places — flagship portfolio"
          loading="eager"
          className="h-full w-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0_0%_5%/0.4)] via-transparent to-[hsl(0_0%_5%)]" />
      </div>

      <div className="pp-animate-reveal relative z-10 max-w-4xl">
        <span className="pp-mono mb-6 inline-block border border-[hsl(38_25%_48%/0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[hsl(38_25%_48%)]">
          RWA portfolio · Base mainnet
        </span>
        <h1 className="pp-display mb-8 text-balance text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          Own heritage. <span className="italic text-[hsl(38_25%_48%)]">On-chain.</span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-pretty text-base font-light leading-relaxed text-[hsl(30_10%_92%/0.5)] md:text-xl">
          Tokenized Austrian real estate with REOC metadata, permissioned transfers, and
          Chainlink-aligned compliance — starting with Berggasse and three curated assets.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#portfolio-grid"
            className="inline-flex min-h-11 min-w-[220px] items-center justify-center border border-[hsl(0_0%_100%/0.2)] px-8 py-4 text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm transition-colors hover:border-[hsl(0_0%_100%/0.5)]"
          >
            Explore properties
          </Link>
          <Link
            href={flagshipHref}
            className="inline-flex min-h-11 min-w-[220px] items-center justify-center bg-[hsl(30_15%_92%)] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(0_0%_5%)] transition-all hover:bg-[hsl(38_25%_48%)] hover:text-[hsl(0_0%_5%)]"
          >
            Berggasse flagship
          </Link>
        </div>
      </div>

      <div className="pp-mono absolute bottom-10 left-1/2 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-[hsl(30_10%_92%/0.5)] sm:block">
        Scroll · Portfolio yields
      </div>
    </section>
  );
}
