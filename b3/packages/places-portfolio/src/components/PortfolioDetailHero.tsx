import type { PortfolioDetailHeroProps } from "../types.js";
import { resolveLink } from "./link.js";

export function PortfolioDetailHero({
  presentation,
  heroImageUrl,
  galleryUrls,
  symbol,
  shareToken,
  explorerBase = "https://basescan.org/address",
  reocHref,
  investHref,
  tradeHref,
  canInvest,
  complianceHint,
  LinkComponent,
}: PortfolioDetailHeroProps) {
  const Link = resolveLink(LinkComponent);

  return (
    <section className="border-b border-[hsl(0_0%_100%/0.1)] bg-[#0a0a0a]">
      <div className="relative aspect-[21/9] max-h-[520px] w-full overflow-hidden">
        <img src={heroImageUrl} alt={presentation.headline} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <span className="pp-mono mb-3 inline-block border border-[hsl(38_25%_48%/0.4)] px-2 py-1 text-[10px] uppercase tracking-widest text-[hsl(38_25%_48%)]">
            {presentation.badge} · {symbol}
          </span>
          <h1 className="pp-display max-w-4xl text-4xl italic tracking-tight md:text-6xl">
            {presentation.headline}
          </h1>
          <p className="mt-3 max-w-2xl text-[hsl(30_10%_92%/0.6)]">{presentation.location}</p>
          {presentation.emotionalHero ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[hsl(30_15%_92%/0.8)]">
              {presentation.emotionalHero}
            </p>
          ) : null}
        </div>
      </div>

      {galleryUrls.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-b border-[hsl(0_0%_100%/0.1)] px-8 py-4">
          {galleryUrls.slice(0, 5).map((g) => (
            <img
              key={g.url}
              src={g.url}
              alt={g.alt}
              className="h-20 w-32 shrink-0 rounded object-cover opacity-80"
            />
          ))}
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-8 px-8 py-10 md:grid-cols-[1fr_auto]">
        <div className="space-y-4 text-sm text-[hsl(30_10%_92%/0.55)]">
          <p>
            Reference acquisition {presentation.acquisitionEur.toLocaleString("de-AT")} € · yield band{" "}
            {presentation.yieldLabel} · {presentation.unitCountLabel}
          </p>
          {complianceHint ? <p className="text-[hsl(38_25%_48%)]">{complianceHint}</p> : null}
          <div className="flex flex-wrap gap-4 pt-2">
            <a href={reocHref} target="_blank" rel="noreferrer noopener" className="pp-mono text-xs text-[hsl(38_25%_48%)] hover:underline">
              REOC metadata JSON ↗
            </a>
            {shareToken ? (
              <a
                href={`${explorerBase}/${shareToken}`}
                target="_blank"
                rel="noreferrer noopener"
                className="pp-mono text-xs text-[hsl(30_10%_92%/0.5)] hover:underline"
              >
                Share token on BaseScan ↗
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={investHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-disabled={!canInvest}
            className={`px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] ${
              canInvest
                ? "bg-[hsl(38_25%_48%)] text-[hsl(0_0%_5%)] hover:opacity-90"
                : "cursor-not-allowed border border-[hsl(0_0%_100%/0.15)] text-[hsl(30_10%_92%/0.4)]"
            }`}
          >
            Invest ↗
          </a>
          <Link
            href={tradeHref}
            className="border border-[hsl(0_0%_100%/0.2)] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] hover:border-[hsl(38_25%_48%/0.5)]"
          >
            Trade on Places ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
