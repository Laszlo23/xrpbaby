import type { Metadata } from "next";
import Link from "next/link";
import { HeroBackground } from "@/components/HeroBackground";
import { FundingMeter } from "@/components/FundingMeter";
import { TrustSection } from "@/components/TrustSection";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { ButtonLink } from "@/components/ui/Button";
import { getGlobalFundingMeter, getGlobalPlatformStats } from "@/lib/funding-stats";
import { SocialProofBand } from "@/components/home/SocialProofBand";
import { ProblemSolutionSection } from "@/components/home/ProblemSolutionSection";
import { PlatformEcosystemSection } from "@/components/home/PlatformEcosystemSection";
import { VisionSection } from "@/components/home/VisionSection";
import { CommunityOwnershipSection } from "@/components/home/CommunityOwnershipSection";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { HomeDisclaimerStrip } from "@/components/home/HomeDisclaimerStrip";
import { HomeFeaturedProperties } from "@/components/home/HomeFeaturedProperties";
import { HomeHowItWorksSimple } from "@/components/home/HomeHowItWorksSimple";
import { CulturalEcosystemFlow } from "@/components/home/CulturalEcosystemFlow";
import { RealWorldOnChainSection } from "@/components/home/RealWorldOnChainSection";
import { FlagshipProjectSection } from "@/components/home/FlagshipProjectSection";
import { FoundingInvestorsSection } from "@/components/home/FoundingInvestorsSection";
import { EcosystemPartnersSection } from "@/components/home/EcosystemPartnersSection";
import { HomeCommunityFeed } from "@/components/home/HomeCommunityFeed";
import { HomeGuestbookStrip } from "@/components/home/HomeGuestbookStrip";
import { HomeIntroRedirect } from "@/components/home/HomeIntroRedirect";
import { FLAGSHIP_PROPERTY_ID } from "@/lib/flagship-campaign";
import { CULTURE_LAND_CHAIN_MANIFESTO } from "@/lib/culture-land-portfolio";
import { CultureLandImageStrip } from "@/components/home/CultureLandImageStrip";
import { HomePageJsonLd } from "@/components/seo/HomePageJsonLd";

/** Talent app domain verification — must appear on the homepage <head>. */
export const metadata: Metadata = {
  other: {
    "talentapp:project_verification":
      "e960f18a1356b6f99de376cde74522d2a12215e74741b1cfd909876bfdf5c22e69a0ec4049043ef69795e249624cf583c5589aa671635e00fffcd6bd1fb266ee",
    "base:app_id": "69eaf432e67b282fc52d29ee",
  },
};

export default function Home() {
  const globalFunding = getGlobalFundingMeter();
  const platform = getGlobalPlatformStats();
  const flagshipHref = `/properties/${FLAGSHIP_PROPERTY_ID.toString()}`;

  return (
    <div className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8">
      <HomePageJsonLd />
      <HomeIntroRedirect />
      <HeroBackground />

      <div className="stagger-fade relative z-10 mx-auto max-w-4xl space-y-6 pb-8 pt-8 text-center sm:space-y-8 sm:pt-14">
        <Link
          href={flagshipHref}
          className="inline-flex items-center gap-2 rounded-full border border-action/40 bg-action/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-action-light transition hover:border-action/60 hover:bg-action/20"
        >
          Flagship funding round live
          <span aria-hidden className="text-action">
            →
          </span>
        </Link>
        <p className="inline-flex rounded-full border border-eco/30 bg-eco/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-eco-light">
          Building Culture · Base
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
          Own a piece of Europe&apos;s architectural heritage.
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-canvas sm:text-xl">
          A new model for community-owned real estate — where cultural buildings become shared assets and long-term
          investments.
        </p>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Launching with curated properties in Vienna. Scaling toward a global portfolio of cultural real estate.
        </p>

        <div className="mx-auto w-full max-w-2xl px-0 text-left">
          <FundingMeter
            stats={globalFunding}
            label="Community funding raised"
            propertiesOnboarded={platform.propertiesFunded}
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <ButtonLink href="/culture-land">Explore Culture Land portfolio</ButtonLink>
          <ButtonLink href="/properties" variant="secondary">
            On-chain listings
          </ButtonLink>
        </div>
        <p className="text-sm text-muted">
          <Link href="/start" className="text-eco-light underline-offset-4 transition hover:text-canvas hover:underline">
            New here? Start with a simple walkthrough
          </Link>
          <span className="mx-2 text-zinc-600" aria-hidden>
            ·
          </span>
          <Link href="/mission" className="text-eco-light underline-offset-4 transition hover:text-canvas hover:underline">
            Read the Vision
          </Link>
        </p>

        <p className="text-xs text-muted">
          Primary deployment on Base. Economics are issuer-led — see disclosures, contracts, and{" "}
          <Link href="/legal/risk" className="text-eco-light underline-offset-4 hover:text-canvas hover:underline">
            Legal
          </Link>{" "}
          before allocating capital.
        </p>

        <div className="mx-auto w-full max-w-3xl space-y-4 text-left text-sm leading-relaxed text-muted sm:text-center">
          {CULTURE_LAND_CHAIN_MANIFESTO.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="mx-auto w-full max-w-[1280px]">
          <CultureLandImageStrip />
        </div>

        <div className="mx-auto w-full max-w-[1280px]">
          <LiveActivityFeed variant="ticker" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] space-y-16 pb-16 sm:space-y-24">
        <FlagshipProjectSection />

        <EcosystemPartnersSection />

        <SocialProofBand funding={globalFunding} platform={platform} />

        <FoundingInvestorsSection />

        <HomeHowItWorksSimple />

        <ProblemSolutionSection />

        <PlatformEcosystemSection />

        <section className="glass-card border-eco/20 p-6 sm:p-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">How value flows</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">Community to investors</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            A simplified view of how backing becomes programmable exposure — actual terms vary by issuer.
          </p>
          <div className="mt-10">
            <CulturalEcosystemFlow />
          </div>
        </section>

        <RealWorldOnChainSection />

        <HomeFeaturedProperties />

        <div className="grid gap-8 lg:grid-cols-2">
          <HomeCommunityFeed limit={5} />
          <div className="glass-card flex flex-col justify-center border-eco/20 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-canvas">Why tokenize</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Transparent liquidity and programmable settlement can sit alongside traditional bank-led leverage — see
              mission for the full story.
            </p>
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-canvas">Community activity</h3>
              <p className="text-xs text-muted">Synthetic feed — not on-chain events.</p>
              <LiveActivityFeed variant="list" />
            </div>
            <Link
              href="/mission"
              className="mt-6 inline-flex w-fit rounded-full border border-action/50 bg-action/10 px-5 py-2 text-sm font-semibold text-action-light hover:bg-action/20"
            >
              Read mission →
            </Link>
          </div>
        </div>

        <HomeGuestbookStrip />

        <TrustSection />

        <VisionSection />

        <CommunityOwnershipSection />

        <HomeFinalCta />

        <HomeDisclaimerStrip />

        <section className="rounded-2xl border border-eco/15 bg-forest/20 px-6 py-8 sm:px-10">
          <h2 className="text-lg font-semibold text-canvas">Learn more</h2>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Link href="/how-it-works" className="font-medium text-action hover:underline">
              Investor walkthrough →
            </Link>
            <Link href="/guide" className="text-muted hover:text-canvas">
              Operator guide →
            </Link>
            <Link href="/build-with-us" className="text-muted hover:text-canvas">
              Build with us →
            </Link>
            <Link href="/legal" className="text-muted hover:text-canvas">
              Legal &amp; risks →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
