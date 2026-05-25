import type { FundingStats, GlobalPlatformStats } from "@/lib/funding-stats";
import { PartnerLogoStrip } from "@/components/home/PartnerLogoStrip";

type Props = {
  funding: FundingStats;
  platform: GlobalPlatformStats;
};

export function SocialProofBand({ funding, platform }: Props) {
  const fundedFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(funding.fundedUsd);

  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0 pb-12 pt-4">
      <p className="text-center text-sm font-medium text-canvas sm:text-base">Community metrics</p>
      <p className="mx-auto mt-2 max-w-lg text-center text-xs text-muted">
        Reference campaign figures — not live offering or on-chain TVL.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="rounded-2xl border border-eco/15 bg-forest/35 px-5 py-8 text-center shadow-lg shadow-black/20">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Capital raised</p>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-canvas sm:text-3xl">
            {fundedFmt}
          </p>
        </div>
        <div className="rounded-2xl border border-eco/15 bg-forest/35 px-5 py-8 text-center shadow-lg shadow-black/20">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Investors</p>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-canvas sm:text-3xl">
            {funding.investors.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-eco/15 bg-forest/35 px-5 py-8 text-center shadow-lg shadow-black/20">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Properties onboarded</p>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-canvas sm:text-3xl">
            {platform.propertiesFunded}
          </p>
        </div>
        <div className="rounded-2xl border border-eco/15 bg-forest/35 px-5 py-8 text-center shadow-lg shadow-black/20">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Countries represented</p>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-canvas sm:text-3xl">
            {funding.countries}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-[10px] leading-relaxed text-muted">
        Reference metrics where marked — issuer disclosures and Legal before any commitment.
      </p>
      <PartnerLogoStrip />
    </section>
  );
}
