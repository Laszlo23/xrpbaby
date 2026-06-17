import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { IdentityGraphPanel, LinkedIdentitiesGrid } from "@/components/identity/IdentityGraphPanel";
import { TrustCredentials } from "@/components/identity/TrustCredentials";
import { useCultureNameOwnership } from "@/components/identity/useCultureNameOwnership";
import { CultureScore } from "@/components/profile/CultureScore";
import { NFTStrip } from "@/components/profile/NFTStrip";
import { ProfileFooterCTA } from "@/components/profile/ProfileFooterCTA";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { cultureGatewayPath, cultureProfileUrl } from "@/lib/identity/urls";
import { explorerAddressUrl } from "@/lib/explorer";
import { getIdentityNetwork } from "@/lib/identity/networks";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import type { CultureIdentityEnrichment } from "@/server/identity/showcase-enrichment";

type Props = {
  resolved: ResolvedCultureName;
  paramName: string;
  enrichment: CultureIdentityEnrichment | null;
};

const SCORE_EXPLANATION =
  "Culture Score combines Farcaster reach, verified wallets, onchain activity, badges, holdings, and ecosystem participation.";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Enriched claimed profile with Web3.bio identity graph for all Culture Layer names. */
export function EnrichedCultureProfile({ resolved, paramName, enrichment }: Props) {
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

  const displayName = resolved.fullName || paramName.toLowerCase();
  const profileUrl = cultureProfileUrl(displayName);
  const graph = enrichment?.web3bio?.graph ?? [];
  const primary = enrichment?.web3bio?.primaryNode;
  const avatarUrl = enrichment?.avatarImageUrl ?? primary?.avatar ?? null;
  const bio = primary?.description ?? null;
  const cultureScore = enrichment?.cultureScore;

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

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="relative shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[#C5FF41]/30 bg-zinc-900 md:h-28 md:w-28">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1a2840] to-black">
                  <span className="font-display text-2xl font-bold text-[#C5FF41]">
                    {(resolved.handle ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="mono-label !text-[#C5FF41]">CULTURE LAYER NAME</p>
            <h1 className="mt-2 font-display text-4xl font-bold">
              {resolved.handle}
              <span className="text-[#C5FF41]">.{resolved.tld}</span>
            </h1>
            {resolved.isFounding ? (
              <span className="mt-3 inline-block rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#C5FF41]">
                Founding member
              </span>
            ) : null}
            {bio ? <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">{bio}</p> : null}
            {enrichment?.followerCount != null ? (
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {enrichment.followerCount.toLocaleString()} social followers
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-12 md:gap-14">
          {graph.length > 0 ? (
            <>
              <IdentityGraphPanel cultureName={displayName} graph={graph} />
              <LinkedIdentitiesGrid graph={graph} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-zinc-400">
                No linked Web3 identities found yet for this wallet. Connect ENS, Farcaster, or Lens
                to your owner address to populate the graph.
              </p>
            </div>
          )}

          <TrustCredentials credentials={enrichment?.credentials ?? null} />

          {cultureScore ? (
            <CultureScore
              score={cultureScore.score}
              note={cultureScore.note}
              rank={cultureScore.rank}
              explanation={SCORE_EXPLANATION}
              dimensions={cultureScore.dimensions}
            />
          ) : null}

          {enrichment?.nfts && enrichment.nfts.length > 0 ? (
            <NFTStrip nfts={enrichment.nfts} displayHandle={displayName} />
          ) : null}

          <div className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm">
            <p className="text-zinc-400">
              This is your <strong className="text-white">culture namespace</strong> on Base — not an
              ICANN domain, but a real onchain name that resolves in {BRAND_DISPLAY_NAME} and share
              links.
            </p>
            {resolved.owner ? (
              <p className="font-mono text-zinc-300">Owner: {shortAddress(resolved.owner)}</p>
            ) : null}
            {bnbName ? (
              <p className="text-zinc-300">
                BNB identity:{" "}
                <a
                  href={`https://space.id/name/${bnbName}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[#F0B90B] hover:underline"
                >
                  {bnbName}
                </a>
              </p>
            ) : null}
            {enrichment?.member ? (
              <p className="text-zinc-400">
                Platform member · {enrichment.member.culturePoints.toLocaleString()} Culture Points ·{" "}
                {enrichment.member.supporterTier} tier
              </p>
            ) : null}
            {resolved.mintedAt ? (
              <p className="text-zinc-500">
                Minted: {new Date(resolved.mintedAt).toLocaleDateString()}
              </p>
            ) : null}
            <p className="break-all text-zinc-500">
              Share: <span className="text-[#00E5FF]">{profileUrl}</span>
            </p>
            <p className="text-zinc-600">
              Short link: {cultureGatewayPath(displayName)} (redirects here)
            </p>
          </div>

          {ownership.isOwner ? (
            <p className="text-sm text-[#C5FF41]">You own this name (wallet verified).</p>
          ) : ownership.isConnected && resolved.owner ? (
            <button
              type="button"
              disabled={ownership.verifying}
              onClick={() => void ownership.proveOwnership()}
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-[#C5FF41]/50"
            >
              {ownership.verifying ? "Verifying…" : "Prove you own this name"}
            </button>
          ) : (
            <p className="text-sm text-zinc-500">Connect the owner wallet to verify.</p>
          )}
          {ownership.verifyError ? (
            <p className="text-sm text-red-400">{ownership.verifyError}</p>
          ) : null}

          <ProfileFooterCTA />

          <footer className="flex flex-wrap gap-4 border-t border-white/[0.06] pt-6 text-xs text-zinc-500">
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
        </div>
      </div>
    </div>
  );
}
