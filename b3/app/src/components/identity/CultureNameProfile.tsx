import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { isFounderShowcaseProfile } from "@/lib/profile/founder-showcase";
import type { CultureIdentityEnrichment } from "@/lib/profile/showcase-types";
import { EnrichedCultureProfile } from "@/components/identity/EnrichedCultureProfile";
import { FounderShowcaseProfile } from "@/components/profile/FounderShowcaseProfile";
import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { parseIdentityFullName } from "@/lib/identity/tlds";
import { Link } from "@tanstack/react-router";

type Props = {
  resolved: ResolvedCultureName;
  paramName: string;
  enrichment?: CultureIdentityEnrichment | null;
};

export function CultureNameProfile({ resolved, paramName, enrichment = null }: Props) {
  const founderProfileName = resolved.fullName?.trim() || paramName.trim();
  if (isFounderShowcaseProfile(founderProfileName)) {
    return (
      <FounderShowcaseProfile
        resolved={
          resolved.fullName
            ? resolved
            : { ...resolved, fullName: founderProfileName.toLowerCase() }
        }
        enrichment={enrichment}
      />
    );
  }

  if (resolved.status === "invalid") {
    const parsed = parseIdentityFullName(paramName);
    const mintSearch = parsed
      ? { name: parsed.handle, tld: `.${parsed.tld}`, ref: IDENTITY_LAUNCH_REFERRAL_CODE }
      : { ref: IDENTITY_LAUNCH_REFERRAL_CODE };

    return (
      <div className="bc-surface min-h-screen px-6 py-16 pb-nav-safe text-white">
        <Link to="/pass" className="text-sm text-zinc-500 hover:text-white">
          ← Claim a name
        </Link>
        <p className="mono-label mt-8 !text-amber-300">Can&apos;t read this name</p>
        <h1 className="mt-4 font-display text-3xl font-bold">{paramName}</h1>
        <p className="mt-4 max-w-lg text-zinc-400">
          Culture names use lowercase letters and numbers only, like{" "}
          <code className="text-zinc-200">yourname.culture</code>. Enter just the handle on the mint
          page — the <code className="text-zinc-200">.culture</code> suffix is added for you.
        </p>
        <Link
          to="/pass"
          search={mintSearch}
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white sm:w-auto"
        >
          Mint on Base Mainnet →
        </Link>
      </div>
    );
  }

  if (resolved.status === "available") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 pb-nav-safe text-white">
        <Link to="/pass" className="text-sm text-zinc-500 hover:text-white">
          ← Claim a name
        </Link>
        <p className="mono-label mt-8 !text-[#C5FF41]">Available to mint</p>
        <h1 className="mt-4 font-display text-4xl font-bold">
          {resolved.handle}
          <span className="text-[#C5FF41]">.{resolved.tld}</span>
        </h1>
        <p className="mt-4 max-w-lg text-zinc-400">
          This name is not minted yet. Connect on{" "}
          <strong className="text-white">Base Mainnet</strong>, use invite code{" "}
          <strong className="text-[#C5FF41]">{IDENTITY_LAUNCH_REFERRAL_CODE}</strong>, and pay about
          $0.07 if you&apos;re among the first 77 minters.
        </p>
        <Link
          to="/pass"
          search={{
            name: resolved.handle,
            tld: `.${resolved.tld}`,
            ref: IDENTITY_LAUNCH_REFERRAL_CODE,
          }}
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white sm:w-auto"
        >
          Mint {resolved.handle}.{resolved.tld} on Base →
        </Link>
      </div>
    );
  }

  if (resolved.status === "unconfigured") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 pb-nav-safe text-white">
        <p className="text-zinc-400">Identity contract is not configured in this environment.</p>
      </div>
    );
  }

  return (
    <EnrichedCultureProfile resolved={resolved} paramName={paramName} enrichment={enrichment} />
  );
}
