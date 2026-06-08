import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

import { platformModules } from "@/lib/modules";
import { chainlinkComplianceCopy } from "@/lib/chainlink-compliance-copy";
import { complianceHint, complianceStatusLabel } from "@/lib/compliance-eligibility-copy";
import { BCC_SYMBOL } from "@/lib/bcc-config";
import { pageHead } from "@/lib/seo";

const PLACES_SITE =
  import.meta.env.VITE_PLACES_SITE_URL?.trim() || "https://places.buildingcultureid.space";
const PLACES_INVEST_PATH = import.meta.env.VITE_PLACES_INVEST_PATH?.trim() || "/investors";
const PLACES_TRADE_PATH = import.meta.env.VITE_PLACES_TRADE_PATH?.trim() || "/marketplace";
const PLACES_TRANSPARENCY_PATH = import.meta.env.VITE_PLACES_TRANSPARENCY_PATH?.trim() || "/docs";

type Eligibility = {
  ok?: boolean;
  configured?: boolean;
  status?: string;
  canHoldRestrictedShares?: boolean;
  placesUrl?: string;
};

export const Route = createFileRoute("/places/")({
  head: () =>
    pageHead({
      title: "Places",
      description:
        "Explore the BUILDCHAIN Places lane for real-estate onboarding, compliance checks, and investor links.",
      path: "/places",
      keywords: ["BUILDCHAIN", "places", "real estate", "compliance", "investors"],
    }),
  component: PlacesPage,
});

function PlacesPage() {
  const { address, isConnected } = useAccount();
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);

  useEffect(() => {
    if (!address) {
      setEligibility(null);
      return;
    }
    void fetch(`/api/compliance/eligibility?wallet=${address}`)
      .then((r) => r.json())
      .then((data: Eligibility) => setEligibility(data))
      .catch(() => setEligibility(null));
  }, [address]);

  if (!platformModules.places) {
    return <p className="p-8 text-white">Places module off.</p>;
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <Link to="/forest" className="text-sm text-zinc-400 hover:text-white">
        ← Forest
      </Link>
      <p className="mono-label mt-8 !text-[#C5FF41]">RWA MARKETPLACE</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Own the Future. Own Real Estate.</h1>
      <p className="mt-4 max-w-xl text-zinc-400">
        {chainlinkComplianceCopy.body} Browse tokenized properties, list your own, and manage holdings on Places.
      </p>

      {isConnected && eligibility ? (
        <div className="mt-4 max-w-xl space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p className="text-zinc-300">
            Wallet compliance:{" "}
            <span className="font-mono text-[#00E5FF]">
              {complianceStatusLabel(eligibility.status)}
            </span>
            {eligibility.canHoldRestrictedShares ? (
              <span className="text-emerald-400"> · eligible for restricted shares</span>
            ) : null}
          </p>
          <p className="text-zinc-500">{complianceHint(eligibility)}</p>
          {eligibility.configured && eligibility.status === "none" ? (
            <a
              href={`${eligibility.placesUrl ?? PLACES_SITE}${PLACES_INVEST_PATH}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block text-[#C5FF41] underline underline-offset-2"
            >
              Start Places verification ↗
            </a>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Connect a wallet to check compliance eligibility.
        </p>
      )}

      <p className="mt-4 max-w-xl text-sm text-zinc-500">
        Culture passes, marketplace NFTs, and social quests use{" "}
        <Link to="/profile" className="text-[#00E5FF] underline underline-offset-2">
          points on Profile
        </Link>
        . Pay with {BCC_SYMBOL} (−11.11%) on{" "}
        <Link to="/pass" className="text-[#00E5FF] underline underline-offset-2">
          Pass
        </Link>{" "}
        when your wallet holds BCC.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={`${PLACES_SITE}/marketplace`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
        >
          RWA Marketplace ↗
        </a>
        <a
          href={`${PLACES_SITE}/list`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/20 px-6 py-3 text-sm hover:border-[#C5FF41]/50"
        >
          List a property ↗
        </a>
        <a
          href={`${PLACES_SITE}/dashboard`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/20 px-6 py-3 text-sm hover:border-[#C5FF41]/50"
        >
          Investor dashboard ↗
        </a>
        <a
          href={`${PLACES_SITE}${PLACES_TRADE_PATH}`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/20 px-6 py-3 text-sm hover:border-[#C5FF41]/50"
        >
          Trade ↗
        </a>
        <a
          href={`${PLACES_SITE}${PLACES_TRANSPARENCY_PATH}`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/20 px-6 py-3 text-sm hover:border-[#C5FF41]/50"
        >
          Transparency ↗
        </a>
        <Link to="/investors" className="self-center text-sm text-zinc-400 hover:text-white">
          Investor materials
        </Link>
      </div>

      <p className="mt-10 max-w-lg text-xs text-zinc-600">
        NFT marketplace at /marketplace is separate from property share securities. Play /play drops
        are experience raffles — not Places tokenized real estate.
      </p>
    </div>
  );
}
