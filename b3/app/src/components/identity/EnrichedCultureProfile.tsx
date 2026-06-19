import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { BcidScorePanel } from "@/components/bcid/BcidScorePanel";
import { DiscoverBcidGrid } from "@/components/bcid/DiscoverBcidGrid";
import { IdentityGraphPanel } from "@/components/identity/IdentityGraphPanel";
import { CultureIdWalletSettings } from "@/components/credentials/CultureIdWalletSettings";
import { TrustCredentials } from "@/components/identity/TrustCredentials";
import { useCultureNameOwnership } from "@/components/identity/useCultureNameOwnership";
import { CultureScore } from "@/components/profile/CultureScore";
import { NFTStrip } from "@/components/profile/NFTStrip";
import { ProfileFooterCTA } from "@/components/profile/ProfileFooterCTA";
import { ProfileShareBar } from "@/components/identity/ProfileShareBar";
import { ProfileGamificationBar } from "@/components/profile/ProfileGamificationBar";
import { ProfileSocialStrip } from "@/components/profile/ProfileSocialStrip";
import { ProfileWeb3Feed } from "@/components/profile/ProfileWeb3Feed";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import type { IdentityGraphNode } from "@/lib/identity/identity-graph-types";
import { cultureGatewayPath, cultureProfileUrl } from "@/lib/identity/urls";
import { explorerAddressUrl } from "@/lib/explorer";
import { getIdentityNetwork } from "@/lib/identity/networks";
import { computeProfileGamification } from "@/lib/profile/gamification";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import type { CultureIdentityEnrichment } from "@/lib/profile/showcase-types";

type Props = {
  resolved: ResolvedCultureName;
  paramName: string;
  enrichment: CultureIdentityEnrichment | null;
};

const SCORE_EXPLANATION =
  "Culture Reputation combines credentials, contributions, social trust, onchain activity, and human verification.";

const EMPTY_ACTIVITY = {
  product: [],
  community: [],
  onchain: [],
  social: [],
} as CultureIdentityEnrichment["activity"];

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function resolveFarcasterFromGraph(graph: IdentityGraphNode[]): string | null {
  const fc = graph.find((n) => n.platform === "farcaster");
  if (fc?.identity) return fc.identity.replace(/^@/, "");
  if (fc?.displayName) return fc.displayName.replace(/^@/, "");
  return null;
}

function credentialCount(credentials: CultureIdentityEnrichment["credentials"]): number {
  if (!credentials) return 0;
  return credentials.isHuman.length + credentials.isRisky.length + credentials.isSpam.length;
}

/** Enriched claimed profile with Web3.bio identity graph for all Culture Layer names. */
export function EnrichedCultureProfile({ resolved, paramName, enrichment }: Props) {
  const ownership = useCultureNameOwnership(resolved);
  const [bnbName, setBnbName] = useState<string | null>(null);
  const [bcidScores, setBcidScores] = useState<{
    did: string;
    publicHandle: string | null;
    builder: number;
    trust: number;
    contribution: number;
    verification: number;
    credentialCount: number;
  } | null>(null);

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

  useEffect(() => {
    const cultureHandle = resolved.fullName?.toLowerCase();
    if (!cultureHandle) {
      setBcidScores(null);
      return;
    }
    fetch(`/api/bcid/by-culture?handle=${encodeURIComponent(cultureHandle)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) {
          setBcidScores({
            did: d.did,
            publicHandle: d.publicHandle,
            builder: d.builder,
            trust: d.trust,
            contribution: d.contribution,
            verification: d.verification,
            credentialCount: d.credentialCount,
          });
        } else {
          setBcidScores(null);
        }
      })
      .catch(() => setBcidScores(null));
  }, [resolved.fullName]);

  const displayName = resolved.fullName || paramName.toLowerCase();
  const profileUrl = cultureProfileUrl(displayName);
  const graph = enrichment?.web3bio?.graph ?? [];
  const primary = enrichment?.web3bio?.primaryNode;
  const avatarUrl = enrichment?.avatarImageUrl ?? primary?.avatar ?? null;
  const bio = primary?.description ?? null;
  const cultureScore = enrichment?.cultureScore;
  const activity = enrichment?.activity ?? EMPTY_ACTIVITY;
  const farcasterUsername = resolveFarcasterFromGraph(graph);

  const gamification = useMemo(
    () =>
      computeProfileGamification({
        culturePoints: enrichment?.member?.culturePoints,
        cultureScore: cultureScore?.score,
        bcidBuilder: bcidScores?.builder,
        bcidTrust: bcidScores?.trust,
        bcidContribution: bcidScores?.contribution,
        bcidVerification: bcidScores?.verification,
        credentialCount: credentialCount(enrichment?.credentials ?? null),
        bcidCredentialCount: bcidScores?.credentialCount,
        isFounding: resolved.isFounding,
        hasBcid: !!bcidScores,
        humanVerified: (enrichment?.credentials?.isHuman.length ?? 0) > 0,
        platformCount: graph.length,
      }),
    [enrichment, cultureScore, bcidScores, resolved.isFounding, graph.length],
  );

  return (
    <div className="bc-surface relative min-h-dvh pb-32 text-white sm:pb-24">
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Link to="/forest" className="text-sm text-zinc-500 hover:text-white">
          ← Back to dashboard
        </Link>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="relative shrink-0">
            <motion.div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#C5FF41] via-[#00E5FF] to-[#C5FF41] opacity-50 blur-md"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              aria-hidden
            />
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-[#C5FF41]/50 bg-zinc-900 shadow-[0_0_32px_-8px_#C5FF41] md:h-28 md:w-28">
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
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#C5FF41] font-display text-xs font-bold text-black">
              {gamification.level}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="mono-label !text-[#C5FF41]">CULTURE LAYER NAME</p>
            <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
              {resolved.handle}
              <span className="text-[#C5FF41]">.{resolved.tld}</span>
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {resolved.isFounding ? (
                <span className="inline-block rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#C5FF41]">
                  Founding member
                </span>
              ) : null}
              {bcidScores ? (
                <span className="inline-block rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#00E5FF]">
                  BCID verified
                </span>
              ) : null}
            </div>
            {bio ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">{bio}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ProfileShareBar
                shareUrl={profileUrl}
                title={`${displayName} on Building Culture`}
                text={`Check out ${displayName}'s culture profile`}
              />
              <Link
                to="/id/$name/card"
                params={{ name: displayName }}
                className="text-xs text-zinc-500 underline hover:text-[#00E5FF]"
              >
                Share card →
              </Link>
            </div>
            {enrichment?.member ? (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                {enrichment.member.completedQuestCount ?? 0} stories ·{" "}
                {enrichment.member.culturePoints ?? 0} Culture Points ·{" "}
                {enrichment.member.supporterTier}
              </p>
            ) : null}
            {enrichment?.followerCount != null ? (
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {enrichment.followerCount.toLocaleString()} social followers
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <ProfileGamificationBar gamification={gamification} />
        </div>

        <div className="mt-10 flex flex-col gap-12 md:gap-14">
          {graph.length > 0 ? <ProfileSocialStrip graph={graph} /> : null}

          <ProfileWeb3Feed
            activity={activity}
            farcasterUsername={farcasterUsername}
            neynarEnabled={enrichment?.neynarEnabled ?? false}
          />

          {graph.length > 0 ? (
            <IdentityGraphPanel cultureName={displayName} graph={graph} />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-zinc-400">
                No linked Web3 identities found yet for this wallet. Connect ENS, Farcaster, or Lens
                to your owner address to populate the graph.
              </p>
            </div>
          )}

          <TrustCredentials credentials={enrichment?.credentials ?? null} />

          {ownership.isOwner ? (
            <CultureIdWalletSettings
              handle={displayName}
              address={resolved.owner}
              title="Linked wallets"
            />
          ) : null}

          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              to={`/id/${displayName}/credentials` as "/id/$name/credentials"}
              params={{ name: displayName }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-zinc-300 hover:border-[#C5FF41]/40 hover:text-white"
            >
              Credentials →
            </Link>
            <Link
              to={`/id/${displayName}/reputation` as "/id/$name/reputation"}
              params={{ name: displayName }}
              className="rounded-full border border-white/15 px-4 py-1.5 text-zinc-300 hover:border-[#C5FF41]/40 hover:text-white"
            >
              Reputation →
            </Link>
            <Link
              to="/credentials"
              className="rounded-full border border-white/15 px-4 py-1.5 text-zinc-300 hover:border-[#C5FF41]/40 hover:text-white"
            >
              Credential Center
            </Link>
            <Link
              to="/bcid/leaderboard"
              className="rounded-full border border-[#00E5FF]/30 px-4 py-1.5 text-[#00E5FF]/80 hover:border-[#00E5FF]/50 hover:text-[#00E5FF]"
            >
              BCID leaderboard
            </Link>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            {cultureScore ? (
              <CultureScore
                score={cultureScore.score}
                note={cultureScore.note}
                rank={cultureScore.rank}
                explanation={SCORE_EXPLANATION}
                dimensions={cultureScore.dimensions}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-zinc-500">
                Culture Score unlocks as credentials and activity accumulate.
              </div>
            )}

            {bcidScores ? (
              <BcidScorePanel
                did={bcidScores.did}
                publicHandle={bcidScores.publicHandle}
                builder={bcidScores.builder}
                trust={bcidScores.trust}
                contribution={bcidScores.contribution}
                verification={bcidScores.verification}
                credentialCount={bcidScores.credentialCount}
                isOwner={ownership.isOwner}
              />
            ) : ownership.isOwner ? (
              <div className="rounded-2xl border border-dashed border-[#C5FF41]/30 bg-[#C5FF41]/5 p-6 text-center">
                <p className="text-sm text-zinc-400">
                  Bridge this <code className="text-zinc-200">.culture</code> name to a BCID for
                  verifiable reputation scores.
                </p>
                <Link
                  to="/bcid/mint"
                  className="mt-4 inline-block rounded-full bg-[#C5FF41] px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
                >
                  Mint or bridge BCID →
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-zinc-500">
                No BCID bridged to this name yet.
              </div>
            )}
          </div>

          {enrichment?.nfts && enrichment.nfts.length > 0 ? (
            <NFTStrip nfts={enrichment.nfts} displayHandle={displayName} />
          ) : null}

          <DiscoverBcidGrid excludeDid={bcidScores?.did} />

          <div className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm">
            <p className="text-zinc-400">
              This is your <strong className="text-white">culture namespace</strong> on Base — not
              an ICANN domain, but a real onchain name that resolves in {BRAND_DISPLAY_NAME} and
              share links.
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
                Platform member · {enrichment.member.culturePoints.toLocaleString()} Culture Points
                · {enrichment.member.supporterTier} tier
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
            {resolved.isFounding && ownership.isOwner ? (
              <Link to="/pass" search={{ manage: "1" }} className="text-zinc-500 hover:text-white">
                Advanced: claim another name
              </Link>
            ) : null}
          </footer>
        </div>
      </div>
    </div>
  );
}
