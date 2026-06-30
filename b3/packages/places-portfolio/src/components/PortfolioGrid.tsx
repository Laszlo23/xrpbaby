import type { PortfolioGridProps } from "../types.js";
import { PortfolioImage } from "./PortfolioImage.js";
import { resolveLink } from "./link.js";

function isExternalHref(href: string): boolean {
  return href.startsWith("http") || href.startsWith("//");
}

export function PortfolioGrid({ cards, LinkComponent, onViewAllHref }: PortfolioGridProps) {
  const Link = resolveLink(LinkComponent);
  const viewAllExternal = onViewAllHref ? isExternalHref(onViewAllHref) : false;

  return (
    <section id="portfolio-grid" className="bg-[hsl(0_0%_5%)] px-8 py-32">
      <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="max-w-xl">
          <span className="pp-mono mb-4 block text-[10px] uppercase tracking-[0.3em] text-[hsl(38_25%_48%)]">
            Selected assets
          </span>
          <h2 className="pp-display text-4xl tracking-tight md:text-5xl">Portfolio yields</h2>
          <p className="mt-4 max-w-md text-pretty text-[hsl(30_10%_92%/0.5)]">
            Real Austrian inventory on Base — economics are issuer-led; verify every figure in
            the data room before allocating capital.
          </p>
        </div>
        <div className="text-right">
          <p className="mb-2 text-sm text-[hsl(30_10%_92%/0.5)]">Reference yield band</p>
          <span className="pp-mono text-3xl">7–10%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.1)] md:grid-cols-2 lg:grid-cols-2">
        {cards.map((p) => (
          <article
            key={p.propertyId}
            className="group cursor-pointer overflow-hidden bg-[hsl(0_0%_5%)] p-8 transition-colors hover:bg-[#0d0d0d]"
          >
            <Link href={p.detailHref} className="block">
              <div className="mb-6 flex items-start justify-between">
                <span
                  className={`pp-mono border px-2 py-1 text-[10px] uppercase tracking-widest ${
                    p.badgeAccent
                      ? "border-[hsl(38_25%_48%/0.4)] text-[hsl(38_25%_48%)]"
                      : "border-[hsl(0_0%_100%/0.1)] text-[hsl(30_10%_92%/0.5)]"
                  }`}
                >
                  {p.badge}
                </span>
                <div className="text-right">
                  <p className="pp-mono text-2xl text-[hsl(38_25%_48%)]">{p.yieldLabel}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[hsl(30_10%_92%/0.5)]">
                    Target yield
                  </p>
                </div>
              </div>
              <div className="mb-6 aspect-[4/3] overflow-hidden">
                <PortfolioImage
                  src={p.heroImageUrl}
                  alt={p.headline}
                  className="h-full w-full object-cover grayscale transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
              <h3 className="pp-display mb-2 text-2xl italic">{p.headline}</h3>
              <p className="mb-6 text-sm text-[hsl(30_10%_92%/0.5)]">
                {p.location} · {p.symbol} · {p.unitCountLabel}
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-[hsl(0_0%_100%/0.1)] pt-6">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-[hsl(30_10%_92%/0.5)]">
                    Monthly revenue (ref.)
                  </p>
                  <p className="pp-mono text-sm">{p.monthlyRevenueLabel}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-[hsl(30_10%_92%/0.5)]">
                    Shares / funding
                  </p>
                  <p className="pp-mono text-sm">{p.sharesLabel}</p>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {onViewAllHref ? (
        <div className="mt-12 flex justify-center">
          {viewAllExternal ? (
            <a
              href={onViewAllHref}
              target="_blank"
              rel="noreferrer noopener"
              className="border border-[hsl(0_0%_100%/0.1)] px-8 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-[hsl(38_25%_48%/0.6)]"
            >
              View full portfolio ↗
            </a>
          ) : (
            <Link
              href={onViewAllHref}
              className="border border-[hsl(0_0%_100%/0.1)] px-8 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-[hsl(38_25%_48%/0.6)]"
            >
              View full portfolio →
            </Link>
          )}
        </div>
      ) : null}
    </section>
  );
}
