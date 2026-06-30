import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ATLAS_MARKERS,
  CHAINLINK_MODULES,
  PortfolioAtlas,
  PortfolioChainlinkStrip,
  PortfolioGrid,
  PortfolioHero,
  PortfolioMarquee,
  buildPortfolioCard,
  buildPortfolioMarqueeStats,
  buildPortfolioPresentation,
  resolveMediaUrl,
  reocMetadataUrl,
  type PortfolioLinkProps,
} from "@bc/places-portfolio";
import "@bc/places-portfolio/theme.css";

import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import { useFeaturedPropertyShares } from "@/hooks/useFeaturedPropertyShares";
import { chainlinkComplianceCopy } from "@/lib/chainlink-compliance-copy";
import { complianceHint, complianceStatusLabel } from "@/lib/compliance-eligibility-copy";
import {
  fetchComplianceEligibility,
  type ComplianceEligibilityResponse,
} from "@/lib/fetch-compliance-eligibility";
import { platformModules } from "@/lib/modules";
import {
  PLACES_SITE_URL,
  appPropertyDetailPath,
  placesFullPortfolioUrl,
  placesTransparencyUrl,
} from "@/lib/places-config";
import { getPublicAppOrigin } from "@/lib/app-origin";

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

export function PlacesPortfolioHub() {
  const address = useLinkedWalletAddress();
  const { stats } = useFeaturedPropertyShares();
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);

  useEffect(() => {
    if (!address) {
      setEligibility(null);
      return;
    }
    void fetchComplianceEligibility(address).then(setEligibility);
  }, [address]);

  const cards = useMemo(() => {
    return stats
      .map((s) =>
        buildPortfolioCard({
          propertyId: s.propertyId,
          placesSiteOrigin: PLACES_SITE_URL,
          detailHref: appPropertyDetailPath(s.propertyId),
          sharesLabel: s.sharesLabel,
        }),
      )
      .filter(Boolean);
  }, [stats]);

  const flagship = buildPortfolioPresentation(1);
  const heroUrl = flagship
    ? resolveMediaUrl(PLACES_SITE_URL, flagship.heroImage)
    : resolveMediaUrl(PLACES_SITE_URL, "/t1a1366-bergasse.jpg");

  if (!platformModules.places) {
    return <p className="p-8 text-white">Places module off.</p>;
  }

  const appOrigin = getPublicAppOrigin();

  return (
    <div className="places-portfolio min-h-screen overflow-x-hidden bg-[hsl(0_0%_5%)] text-[hsl(30_15%_92%)]">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_5%/0.6)] px-6 py-4 backdrop-blur-md md:px-8">
        <Link to="/forest" className="pp-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(30_10%_92%/0.5)] hover:text-[hsl(30_15%_92%)]">
          ← Forest
        </Link>
        <span className="pp-display text-lg font-bold uppercase tracking-tighter md:text-xl">
          Places
        </span>
        <a
          href={placesFullPortfolioUrl()}
          target="_blank"
          rel="noreferrer noopener"
          className="pp-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(38_25%_48%)] hover:underline"
        >
          Full catalog ↗
        </a>
      </header>

      <div className="pt-16">
        <PortfolioHero
          heroImageUrl={heroUrl}
          flagshipHref={appPropertyDetailPath(1)}
          LinkComponent={RouterPortfolioLink}
        />
        <PortfolioMarquee stats={buildPortfolioMarqueeStats()} />
        <PortfolioGrid
          cards={cards as NonNullable<(typeof cards)[number]>[]}
          LinkComponent={RouterPortfolioLink}
          onViewAllHref={placesFullPortfolioUrl()}
        />
        <PortfolioAtlas
          markers={ATLAS_MARKERS}
          detailHrefForId={appPropertyDetailPath}
          LinkComponent={RouterPortfolioLink}
        />
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

        <section className="border-t border-[hsl(0_0%_100%/0.1)] px-8 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[hsl(0_0%_100%/0.1)] bg-[#0a0a0a] p-6">
            <p className="pp-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(38_25%_48%)]">
              Wallet compliance
            </p>
            {address && eligibility ? (
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  Status:{" "}
                  <span className="text-[hsl(38_25%_48%)]">
                    {complianceStatusLabel(eligibility.status)}
                  </span>
                  {eligibility.canHoldRestrictedShares ? (
                    <span className="text-emerald-400"> · eligible for restricted shares</span>
                  ) : null}
                </p>
                <p className="text-[hsl(30_10%_92%/0.5)]">{complianceHint(eligibility)}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[hsl(30_10%_92%/0.5)]">
                Connect a wallet to check compliance eligibility before investing.
              </p>
            )}
            <p className="mt-6 text-xs text-[hsl(30_10%_92%/0.35)]">
              REOC metadata served at{" "}
              <span className="pp-mono">{reocMetadataUrl(appOrigin, 1).replace(/\/1$/, "/{id}")}</span>
              . NFT marketplace and Play drops are separate from tokenized property securities.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
