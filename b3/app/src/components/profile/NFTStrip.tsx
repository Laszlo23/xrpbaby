import { ExternalLink } from "lucide-react";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import type { ShowcaseNftItem } from "@/server/identity/showcase-enrichment";
import type { FounderShowcaseConfig } from "@/lib/profile/founder-showcase";

function NftCard({ nft }: { nft: ShowcaseNftItem }) {
  const body = (
    <GlassCard hover className="flex h-full w-[200px] shrink-0 flex-col overflow-hidden p-0 sm:w-[220px]">
      <div className="relative aspect-square w-full bg-zinc-900">
        {nft.imageUrl ? (
          <img src={nft.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : nft.isIdentity ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1a2840] via-black to-[#0a1520] p-4 text-center">
            <p className="font-display text-lg font-bold text-white">Culture Layer</p>
            <p className="mt-1 font-mono text-xs text-[#C5FF41]">Identity NFT</p>
          </div>
        ) : (
          <div className="flex h-full w-full animate-pulse items-center justify-center bg-zinc-800/80">
            <span className="font-mono text-[10px] text-zinc-600">Loading…</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-300">
          {nft.chainLabel}
        </span>
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-semibold text-white">{nft.name}</p>
        {nft.isIdentity ? (
          <p className="text-[10px] uppercase tracking-wider text-[#C5FF41]">Primary identity</p>
        ) : null}
      </div>
    </GlassCard>
  );

  if (nft.openSeaUrl) {
    return (
      <a href={nft.openSeaUrl} target="_blank" rel="noreferrer noopener" className="shrink-0">
        {body}
      </a>
    );
  }
  return body;
}

function PlaceholderCard() {
  return (
    <div className="flex h-full w-[200px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center sm:w-[220px]">
      <p className="text-xs text-zinc-500">More onchain proof coming</p>
    </div>
  );
}

export function NFTStrip({
  nfts,
  config,
  displayHandle,
}: {
  nfts: ShowcaseNftItem[];
  config?: FounderShowcaseConfig;
  displayHandle?: string;
}) {
  const handle = displayHandle ?? config?.handle ?? "Identity";
  const openSeaIdentity = nfts.find((n) => n.isIdentity)?.openSeaUrl;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading title="Onchain collectibles" subtitle="Identity NFT and wallet-held assets on Base." />
        {openSeaIdentity ? (
          <a
            href={openSeaIdentity}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            OpenSea
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-thin">
        {nfts.length > 0 ? (
          nfts.map((nft) => <NftCard key={nft.id} nft={nft} />)
        ) : (
          <NftCard
            nft={{
              id: "identity-placeholder",
              name: handle,
              imageUrl: null,
              chainLabel: "Base",
              openSeaUrl: null,
              isIdentity: true,
            }}
          />
        )}
        {nfts.length > 0 && nfts.length < 4 ? <PlaceholderCard /> : null}
      </div>
    </section>
  );
}
