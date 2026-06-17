import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { TrustCredentials } from "@/components/identity/TrustCredentials";
import { IdentityGraphPanel } from "@/components/identity/IdentityGraphPanel";
import { ProfileHero } from "@/components/profile/Hero";
import { FounderMetrics } from "@/components/profile/FounderMetrics";
import { FeaturedBuilds } from "@/components/profile/FeaturedBuilds";
import { EcosystemMap } from "@/components/profile/EcosystemMap";
import { CultureScore } from "@/components/profile/CultureScore";
import { BuilderSignal } from "@/components/profile/BuilderSignal";
import { NFTStrip } from "@/components/profile/NFTStrip";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { CollaborationCTA } from "@/components/profile/CollaborationCTA";
import { ProfileFooterCTA } from "@/components/profile/ProfileFooterCTA";
import { useCultureNameOwnership } from "@/components/identity/useCultureNameOwnership";
import { getFounderShowcaseConfig } from "@/lib/profile/founder-showcase";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import type { CultureIdentityEnrichment } from "@/server/identity/showcase-enrichment";
import { explorerAddressUrl } from "@/lib/explorer";
import { getIdentityNetwork } from "@/lib/identity/networks";

const SCORE_EXPLANATION =
  "Culture Score combines Farcaster reach, verified wallets, onchain activity, badges, holdings, and ecosystem participation.";

const EMPTY_ACTIVITY = {
  product: [],
  community: [],
  onchain: [],
  social: [],
} as CultureIdentityEnrichment["activity"];

type Props = {
  resolved: ResolvedCultureName;
  enrichment: CultureIdentityEnrichment | null;
};

export function FounderShowcaseProfile({ resolved, enrichment }: Props) {
  const config = getFounderShowcaseConfig(resolved.fullName);
  const ownership = useCultureNameOwnership(resolved);
  const [bnbName, setBnbName] = useState<string | null>(null);

  useEffect(() => {
    const owner = resolved.owner;
    if (!owner) {
      setBnbName(null);
      return;
    }
    fetch(`/api/identity/resolve-bnb?address=${encodeURIComponent(owner)}`)
      .then((r) => r.json())
      .then((d: { ok?: boolean; name?: string }) => {
        setBnbName(d.ok && d.name ? d.name : null);
      })
      .catch(() => setBnbName(null));
  }, [resolved.owner]);

  if (!config) return null;

  const activity = enrichment?.activity ?? EMPTY_ACTIVITY;
  const nfts = enrichment?.nfts ?? [];
  const avatarUrl = config.avatarUrl ?? enrichment?.avatarImageUrl ?? null;
  const cultureScore = enrichment?.cultureScore;
  const graph = enrichment?.web3bio?.graph ?? [];

  return (
    <div className="bc-surface relative min-h-dvh pb-32 text-white sm:pb-24">
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <Link to="/forest" className="text-sm text-zinc-500 hover:text-white">
          ← Forest
        </Link>

        <div className="mt-6 flex flex-col gap-12 md:gap-14">
          <ProfileHero
            resolved={resolved}
            config={config}
            avatarUrl={avatarUrl}
            followerCount={enrichment?.followerCount ?? null}
            isOwner={ownership.isOwner ?? false}
            verifyError={ownership.verifyError}
            verifying={ownership.verifying}
            onProveOwnership={() => void ownership.proveOwnership()}
            isConnected={ownership.isConnected}
          />

          <FounderMetrics
            config={config}
            followerCount={enrichment?.followerCount ?? null}
            resolved={resolved}
          />

          <FeaturedBuilds builds={config.featuredBuilds} />

          <EcosystemMap config={config} />

          {graph.length > 0 ? (
            <IdentityGraphPanel cultureName={config.handle} graph={graph} />
          ) : null}

          <TrustCredentials credentials={enrichment?.credentials ?? null} />

          <div className="grid gap-8 lg:grid-cols-2">
            <CultureScore
              score={cultureScore?.score ?? config.cultureScore}
              note={cultureScore?.note ?? config.cultureScoreNote}
              rank={cultureScore?.rank ?? config.cultureScoreRank}
              explanation={SCORE_EXPLANATION}
              dimensions={cultureScore?.dimensions ?? config.cultureScoreDimensions}
            />
            <BuilderSignal items={config.builderSignals} />
          </div>

          <NFTStrip nfts={nfts} config={config} />

          <ActivityFeed
            activity={activity}
            config={config}
            neynarEnabled={enrichment?.neynarEnabled ?? false}
          />

          <CollaborationCTA config={config} />

          <ProfileFooterCTA />

          {bnbName || resolved.contractAddress ? (
            <footer className="flex flex-wrap gap-4 border-t border-white/[0.06] pt-6 text-xs text-zinc-500">
              {bnbName ? (
                <a
                  href={`https://space.id/name/${bnbName}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#F0B90B] hover:underline"
                >
                  BNB: {bnbName}
                </a>
              ) : null}
              {resolved.contractAddress ? (
                <a
                  href={explorerAddressUrl(
                    resolved.chainId ?? getIdentityNetwork("base").chainId,
                    resolved.contractAddress,
                  )}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-white"
                >
                  Identity contract
                </a>
              ) : null}
              <Link to="/pass" className="text-[#00E5FF] hover:underline">
                Claim another name
              </Link>
            </footer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
