import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { isFounderShowcaseProfile } from "@/lib/profile/founder-showcase";
import type { CultureIdentityEnrichment } from "@/lib/profile/showcase-types";
import { EnrichedCultureProfile } from "@/components/identity/EnrichedCultureProfile";
import { FounderShowcaseProfile } from "@/components/profile/FounderShowcaseProfile";
import { Link } from "@tanstack/react-router";

type Props = {
  resolved: ResolvedCultureName;
  paramName: string;
  enrichment?: CultureIdentityEnrichment | null;
};

export function CultureNameProfile({ resolved, paramName, enrichment = null }: Props) {
  if (resolved.status === "invalid") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 text-white">
        <Link to="/pass" className="text-sm text-zinc-500 hover:text-white">
          ← Claim a name
        </Link>
        <p className="mono-label mt-8 !text-[#C5FF41]">INVALID NAME</p>
        <h1 className="mt-4 font-display text-3xl font-bold">{paramName}</h1>
        <p className="mt-4 text-zinc-400">
          Use lowercase letters and numbers, like{" "}
          <code className="text-zinc-200">laszlo.culture</code>.
        </p>
      </div>
    );
  }

  if (resolved.status === "available") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 text-white">
        <Link to="/pass" className="text-sm text-zinc-500 hover:text-white">
          ← Claim a name
        </Link>
        <p className="mono-label mt-8 !text-[#C5FF41]">AVAILABLE</p>
        <h1 className="mt-4 font-display text-4xl font-bold">
          {resolved.handle}
          <span className="text-[#C5FF41]">.{resolved.tld}</span>
        </h1>
        <p className="mt-4 max-w-lg text-zinc-400">
          This Culture Layer name is not minted yet. Names resolve here and across the app once
          claimed on Base — no separate domain purchase.
        </p>
        <Link
          to="/pass"
          search={{ name: resolved.handle, tld: `.${resolved.tld}` }}
          className="mt-8 inline-flex rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
        >
          Mint this name →
        </Link>
      </div>
    );
  }

  if (resolved.status === "unconfigured") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 text-white">
        <p className="text-zinc-400">Identity contract is not configured in this environment.</p>
      </div>
    );
  }

  if (isFounderShowcaseProfile(resolved.fullName)) {
    return <FounderShowcaseProfile resolved={resolved} enrichment={enrichment} />;
  }

  return <EnrichedCultureProfile resolved={resolved} paramName={paramName} enrichment={enrichment} />;
}
