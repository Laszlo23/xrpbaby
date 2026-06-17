import { Link } from "@tanstack/react-router";
import { ExternalLink, Mail, Sparkles } from "lucide-react";

import { GlassCard, StatusBadge } from "@/components/profile/profile-ui";
import type { FounderShowcaseConfig } from "@/lib/profile/founder-showcase";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { explorerAddressUrl } from "@/lib/explorer";
import { getIdentityNetwork } from "@/lib/identity/networks";
import { cultureProfileUrl } from "@/lib/identity/urls";
import { Button } from "@/components/ui/button";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type HeroProps = {
  resolved: ResolvedCultureName;
  config: FounderShowcaseConfig;
  avatarUrl: string | null;
  followerCount: number | null;
  isOwner: boolean;
  verifyError: string;
  verifying: boolean;
  onProveOwnership: () => void;
  isConnected: boolean;
};

export function ProfileHero({
  resolved,
  config,
  avatarUrl,
  followerCount,
  isOwner,
  verifyError,
  verifying,
  onProveOwnership,
  isConnected,
}: HeroProps) {
  const isTokenOne = resolved.tokenId === "1";
  const mintDate = resolved.mintedAt
    ? new Date(resolved.mintedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const [handleName, handleTld] = config.handle.split(".");

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[rgb(0_35_100/0.35)] via-black/60 to-black p-6 md:p-10">
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-[radial-gradient(circle,rgb(0_82_255/0.22),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(197_255_65/0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-start">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#00E5FF]/40 via-transparent to-[#C5FF41]/30 blur-md" />
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#1a2840] to-black font-display text-4xl font-bold text-white shadow-2xl md:h-32 md:w-32">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={config.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              "L"
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Culture Layer · Founder profile
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
              {config.heroHeadline}
            </h1>
            <p className="font-display text-lg font-semibold text-zinc-300 md:text-xl">
              {handleName}
              <span className="text-[#C5FF41]">.{handleTld}</span>
              <span className="ml-2 text-sm font-medium text-zinc-500">· {config.displayName}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Founder" tone="live" />
            <StatusBadge label="Base mainnet" tone="beta" />
            {resolved.isFounding ? <StatusBadge label="Founding member" tone="live" /> : null}
            {isTokenOne ? <StatusBadge label="Culture Layer token #1" tone="exploring" /> : null}
            <StatusBadge label="Transferable" tone="default" />
          </div>

          <div className="max-w-2xl space-y-1.5">
            {config.heroManifesto.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-zinc-200 md:text-[15px]">
                {line}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-zinc-500">
            {resolved.owner ? (
              <a
                href={explorerAddressUrl(
                  resolved.chainId ?? getIdentityNetwork("base").chainId,
                  resolved.owner,
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="text-zinc-400 hover:text-[#00E5FF]"
              >
                {shortAddress(resolved.owner)}
              </a>
            ) : null}
            {mintDate ? <span>Minted {mintDate}</span> : null}
            {followerCount != null ? (
              <span>{followerCount.toLocaleString()} followers</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm" className="rounded-full">
              <Link to={config.exploreHref}>Explore Building Culture</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <a href={config.warpcastPersonalUrl} target="_blank" rel="noreferrer noopener">
                Follow on Warpcast
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full border-white/15">
              <a href={`mailto:${config.contactEmail}`}>
                <Mail className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Contact
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-zinc-300">
              <a href={config.partnerHref}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Partner
              </a>
            </Button>
          </div>
        </div>
      </div>

      <GlassCard className="mt-6 text-sm" hover={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">
            Share:{" "}
            <span className="font-mono text-[#00E5FF]">{cultureProfileUrl(config.handle)}</span>
          </p>
          {isOwner ? (
            <p className="text-[#C5FF41]">Wallet verified owner</p>
          ) : isConnected && resolved.owner ? (
            <button
              type="button"
              disabled={verifying}
              onClick={onProveOwnership}
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs hover:border-[#C5FF41]/50"
            >
              {verifying ? "Verifying…" : "Prove ownership"}
            </button>
          ) : (
            <p className="text-xs text-zinc-600">Connect owner wallet to verify</p>
          )}
        </div>
        {verifyError ? <p className="mt-2 text-xs text-red-400">{verifyError}</p> : null}
      </GlassCard>
    </section>
  );
}
