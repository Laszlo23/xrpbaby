import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

import { platformModules } from "@/lib/modules";
import { chainlinkComplianceCopy } from "@/lib/chainlink-compliance-copy";

const PLACES_SITE = import.meta.env.VITE_PLACES_SITE_URL?.trim() || "https://buildingculture.capital";

type Eligibility = {
  ok?: boolean;
  status?: string;
  canHoldRestrictedShares?: boolean;
};

export const Route = createFileRoute("/places/")({
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
      <p className="mono-label mt-8 !text-[#C5FF41]">REAL ESTATE ON CHAIN</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Places</h1>
      <p className="mt-4 max-w-xl text-zinc-400">{chainlinkComplianceCopy.body}</p>

      {isConnected && eligibility ? (
        <p className="mt-4 text-sm text-zinc-300">
          Wallet compliance: <span className="font-mono text-[#00E5FF]">{eligibility.status ?? "unknown"}</span>
          {eligibility.canHoldRestrictedShares ? " · eligible for restricted shares" : " · verification may be required"}
        </p>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">Connect a wallet to check compliance eligibility.</p>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={`${PLACES_SITE}/invest`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
        >
          Invest on Places ↗
        </a>
        <a
          href={`${PLACES_SITE}/trade`}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-white/20 px-6 py-3 text-sm hover:border-[#C5FF41]/50"
        >
          Trade ↗
        </a>
        <a
          href={`${PLACES_SITE}/transparency`}
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
        NFT marketplace at /marketplace is separate from property share securities. Play /play drops are experience
        raffles — not Places tokenized real estate.
      </p>
    </div>
  );
}
