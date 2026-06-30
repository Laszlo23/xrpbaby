import type { PortfolioDetailHeroProps } from "../types.js";
import { PortfolioImage } from "./PortfolioImage.js";
import { resolveLink } from "./link.js";

function isExternalHref(href: string): boolean {
  return href.startsWith("http") || href.startsWith("//");
}

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
  const investExternal = isExternalHref(investHref);
  const tradeExternal = isExternalHref(tradeHref);

  return (
    <section className="border-b border-[hsl(0_0%_100%/0.1)] bg-[#0a0a0a]">
      <div className="relative aspect-[21/9] max-h-[520px] w-full overflow-hidden">
        <PortfolioImage
          src={heroImageUrl}
          alt={presentation.headline}
          loading="eager"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <span className="pp-mono mb-3 inline-block border border-[hsl(38_25%_48%/0.4)] px-2 py-1 text-[10px] uppercase tracking-widest text-[hsl(38_25%_48%)]">
            {presentation.badge} · {symbol}
          </span>
          <h1 className="pp-display max-w-4xl text-3xl italic tracking-tight md:text-6xl">
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
        <div className="flex gap-2 overflow-x-auto border-b border-[hsl(0_0%_100%/0.1)] px-6 py-4 md:px-8">
          {galleryUrls.slice(0, 5).map((g) => (
            <PortfolioImage
              key={g.url}
              src={g.url}
              alt={g.alt}
              className="h-20 w-32 shrink-0 rounded object-cover opacity-80"
            />
          ))}
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:px-8">
        <div className="space-y-4 text-sm text-[hsl(30_10%_92%/0.55)]">
          <p>
            Reference acquisition {presentation.acquisitionEur.toLocaleString("de-AT")} € · yield band{" "}
            {presentation.yieldLabel} · {presentation.unitCountLabel}
          </p>
          {complianceHint ? <p className="text-[hsl(38_25%_48%)]">{complianceHint}</p> : null}
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={reocHref}
              target="_blank"
              rel="noreferrer noopener"
              className="pp-mono text-xs text-[hsl(38_25%_48%)] hover:underline"
            >
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
          {canInvest ? (
            investExternal ? (
              <a
                href={investHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center justify-center bg-[hsl(38_25%_48%)] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] text-[hsl(0_0%_5%)] hover:opacity-90"
              >
                Invest ↗
              </a>
            ) : (
              <Link
                href={investHref}
                className="inline-flex min-h-11 items-center justify-center bg-[hsl(38_25%_48%)] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] text-[hsl(0_0%_5%)] hover:opacity-90"
              >
                Invest
              </Link>
            )
          ) : (
            <span
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center border border-[hsl(0_0%_100%/0.15)] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] text-[hsl(30_10%_92%/0.4)]"
              title={complianceHint ?? "Complete compliance before investing"}
            >
              Invest (KYC required)
            </span>
          )}
          {tradeExternal ? (
            <a
              href={tradeHref}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-11 items-center justify-center border border-[hsl(0_0%_100%/0.2)] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] hover:border-[hsl(38_25%_48%/0.5)]"
            >
              Trade on Places ↗
            </a>
          ) : (
            <Link
              href={tradeHref}
              className="inline-flex min-h-11 items-center justify-center border border-[hsl(0_0%_100%/0.2)] px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] hover:border-[hsl(38_25%_48%/0.5)]"
            >
              Trade on Places ↗
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
