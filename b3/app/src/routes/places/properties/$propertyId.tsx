import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CHAINLINK_MODULES,
  PortfolioChainlinkStrip,
  PortfolioDetailHero,
  buildPortfolioPresentation,
  getCatalogEntry,
  resolveMediaUrl,
  reocMetadataUrl,
  type PortfolioLinkProps,
} from "@bc/places-portfolio";
import "@bc/places-portfolio/theme.css";

import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import { chainlinkComplianceCopy } from "@/lib/chainlink-compliance-copy";
import { complianceHint } from "@/lib/compliance-eligibility-copy";
import {
  fetchComplianceEligibility,
  type ComplianceEligibilityResponse,
} from "@/lib/fetch-compliance-eligibility";
import { getPublicAppOrigin } from "@/lib/app-origin";
import {
  PLACES_SITE_URL,
  placesInvestUrl,
  placesMarketplacePropertyUrl,
  placesTradeUrl,
  placesTransparencyUrl,
} from "@/lib/places-config";
import { pageHead } from "@/lib/seo";

type Eligibility = ComplianceEligibilityResponse;

function RouterPortfolioLink({ href, className, style, children }: PortfolioLinkProps) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }
  if (href.startsWith("http") || href.startsWith("//")) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export const Route = createFileRoute("/places/properties/$propertyId")({
  head: ({ params }) => {
    const id = Number(params.propertyId);
    const p = buildPortfolioPresentation(id);
    return pageHead({
      title: p?.headline ?? "Property",
      description: p?.emotionalHero ?? "Building Culture tokenized real estate on Base.",
      path: `/places/properties/${params.propertyId}`,
    });
  },
  component: PlacesPropertyDetailPage,
});

function PlacesPropertyDetailPage() {
  const { propertyId: propertyIdParam } = Route.useParams();
  const propertyId = Number(propertyIdParam);
  const address = useLinkedWalletAddress();
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);

  const presentation = buildPortfolioPresentation(propertyId);
  const catalog = getCatalogEntry(propertyId);

  useEffect(() => {
    if (!address) {
      setEligibility(null);
      return;
    }
    void fetchComplianceEligibility(address).then(setEligibility);
  }, [address]);

  const galleryUrls = useMemo(() => {
    if (!presentation) return [];
    return presentation.imageGallery.map((g) => ({
      url: resolveMediaUrl(PLACES_SITE_URL, g.src),
      alt: g.alt,
    }));
  }, [presentation]);

  if (!presentation || !catalog) {
    return (
      <div className="places-portfolio min-h-screen bg-[hsl(0_0%_5%)] px-8 py-24 text-center text-[hsl(30_15%_92%)]">
        <p>Property not found.</p>
        <Link to="/places" className="mt-4 inline-block text-[hsl(38_25%_48%)] underline">
          Back to portfolio
        </Link>
      </div>
    );
  }

  const appOrigin = getPublicAppOrigin();
  const canInvest = Boolean(eligibility?.canHoldRestrictedShares);
  const hint =
    address && eligibility
      ? complianceHint(eligibility as Parameters<typeof complianceHint>[0])
      : "Connect a wallet to check compliance before investing.";

  return (
    <div className="places-portfolio min-h-screen bg-[hsl(0_0%_5%)] text-[hsl(30_15%_92%)]">
      <header className="border-b border-[hsl(0_0%_100%/0.1)] px-8 py-4">
        <Link to="/places" className="pp-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(30_10%_92%/0.5)] hover:text-[hsl(30_15%_92%)]">
          ← Portfolio
        </Link>
      </header>

      <PortfolioDetailHero
        presentation={presentation}
        heroImageUrl={resolveMediaUrl(PLACES_SITE_URL, presentation.heroImage)}
        galleryUrls={galleryUrls}
        symbol={catalog.symbol}
        shareToken={catalog.shareToken ?? undefined}
        reocHref={reocMetadataUrl(appOrigin, propertyId)}
        investHref={placesInvestUrl(propertyId)}
        tradeHref={placesTradeUrl(propertyId)}
        canInvest={canInvest}
        complianceHint={hint}
        LinkComponent={RouterPortfolioLink}
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-8 py-16 md:grid-cols-2">
        {presentation.buildingStory ? (
          <section>
            <h2 className="pp-display mb-4 text-2xl italic">Building story</h2>
            <p className="text-sm leading-relaxed text-[hsl(30_10%_92%/0.55)]">
              {presentation.buildingStory}
            </p>
          </section>
        ) : null}
        <section>
          <h2 className="pp-display mb-4 text-2xl italic">Highlights</h2>
          <ul className="space-y-2 text-sm text-[hsl(30_15%_92%/0.8)]">
            {presentation.highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
        </section>
        {presentation.investorRightsBullets?.length ? (
          <section>
            <h2 className="pp-mono mb-3 text-[10px] uppercase tracking-[0.25em] text-[hsl(38_25%_48%)]">
              Investor rights
            </h2>
            <ul className="space-y-2 text-sm text-[hsl(30_10%_92%/0.55)]">
              {presentation.investorRightsBullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {presentation.exitOptionsBullets?.length ? (
          <section>
            <h2 className="pp-mono mb-3 text-[10px] uppercase tracking-[0.25em] text-[hsl(38_25%_48%)]">
              Exit options
            </h2>
            <ul className="space-y-2 text-sm text-[hsl(30_10%_92%/0.55)]">
              {presentation.exitOptionsBullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <PortfolioChainlinkStrip
        modules={CHAINLINK_MODULES}
        complianceHeadline={chainlinkComplianceCopy.headline}
        complianceBody={chainlinkComplianceCopy.body}
        disclaimers={chainlinkComplianceCopy.disclaimers}
        transparencyHref={placesTransparencyUrl()}
        matrixHref={chainlinkComplianceCopy.matrixHref}
        appPlacesHref="/places"
        LinkComponent={RouterPortfolioLink}
      />

      <div className="border-t border-[hsl(0_0%_100%/0.1)] px-8 py-10 text-center">
        <a
          href={placesMarketplacePropertyUrl(propertyId)}
          target="_blank"
          rel="noreferrer noopener"
          className="pp-mono text-[11px] uppercase tracking-[0.2em] text-[hsl(38_25%_48%)] hover:underline"
        >
          Full deal room on Places ↗
        </a>
      </div>
    </div>
  );
}
