import type { Address } from "viem";
import type { OnchainIdentity } from "@/lib/chain/identityContract";
import { withCache } from "./cache";
import { fetchFarcasterByWallet, fetchFarcasterCasts, fetchFarcasterChannels } from "./neynar";
import { fetchResolvedName } from "./names";
import { fetchWalletHoldings } from "./holdings";
import { buildEarnedBadges, computeCultureScore } from "./badges";
import type { SocialProfile, TimelineItem, CommunityItem } from "./types";

function daysSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function buildTimeline(
  onchain: OnchainIdentity,
  farcaster: Awaited<ReturnType<typeof fetchFarcasterCasts>>,
  hasFarcaster: boolean,
): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      kind: "mint",
      title: "Identity minted",
      meta: `${onchain.fullName} · ${onchain.chainLabel}`,
      days: daysSince(onchain.mintedAt.toISOString()),
    },
  ];

  if (hasFarcaster) {
    items.push({
      kind: "social",
      title: "Farcaster linked",
      meta: "Verified wallet connection",
      days: 0,
    });
  }

  for (const cast of farcaster.slice(0, 8)) {
    const preview =
      cast.text.length > 60 ? `${cast.text.slice(0, 60)}…` : cast.text;
    const meta =
      cast.likes > 0 || cast.recasts > 0
        ? `${cast.likes} likes · ${cast.recasts} recasts`
        : "cast";
    items.push({
      kind: "cast",
      title: preview || "Cast",
      meta,
      days: daysSince(cast.timestamp),
      href: cast.hash ? `https://warpcast.com/~/conversations/${cast.hash}` : undefined,
    });
  }

  return items;
}

function buildCommunities(
  channels: Awaited<ReturnType<typeof fetchFarcasterChannels>>,
): CommunityItem[] {
  return channels.map((c) => ({
    name: c.name.startsWith("/") ? c.name : `/${c.name}`,
    members: c.memberCount,
    role: "Member",
  }));
}

function emptyProfile(owner: Address, warnings: string[]): SocialProfile {
  return {
    status: "empty",
    owner,
    farcaster: null,
    basename: null,
    holdings: [],
    badges: [],
    timeline: [],
    communities: [],
    cultureScore: 0,
    followers: 0,
    following: 0,
    avatarUrl: null,
    displayName: null,
    accent: "primary",
    sources: [],
    warnings,
  };
}

export async function fetchSocialProfile(
  owner: Address,
  onchain?: OnchainIdentity,
): Promise<SocialProfile> {
  return withCache(`social:${owner.toLowerCase()}`, async () => {
    const warnings: string[] = [];
    const sources: string[] = [];

    const [fcResult, nameResult, holdingsResult] = await Promise.all([
      fetchFarcasterByWallet(owner),
      fetchResolvedName(owner),
      fetchWalletHoldings(
        owner,
        onchain?.tokenId,
        onchain?.fullName,
      ),
    ]);

    const farcaster = fcResult.ok ? fcResult.data : null;
    if (!fcResult.ok && fcResult.error !== "NEYNAR_API_KEY not configured") {
      warnings.push(fcResult.error);
    }
    if (farcaster) sources.push("farcaster");

    const basename = nameResult.ok ? nameResult.data : null;
    if (basename) sources.push(basename.type);
    if (!nameResult.ok) warnings.push(nameResult.error);

    const holdings = holdingsResult.ok ? holdingsResult.data : [];
    if (holdings.length > 0) sources.push("holdings");

    let casts: Awaited<ReturnType<typeof fetchFarcasterCasts>> = [];
    let channels: Awaited<ReturnType<typeof fetchFarcasterChannels>> = [];

    if (farcaster) {
      [casts, channels] = await Promise.all([
        fetchFarcasterCasts(farcaster.fid, 8),
        fetchFarcasterChannels(farcaster.fid),
      ]);
    }

    if (!onchain && !farcaster && !basename) {
      return emptyProfile(owner, warnings);
    }

    const badges = onchain
      ? buildEarnedBadges(onchain, farcaster, basename)
      : buildEarnedBadges(
          {
            tokenId: 0n,
            owner,
            fullName: "",
            handle: "",
            tld: "culture",
            tldId: 0,
            mintedAt: new Date(),
            isFounding: false,
            isTransferable: true,
            chainLabel: "Base Sepolia",
          },
          farcaster,
          basename,
        );

    const timeline = onchain
      ? buildTimeline(onchain, casts, Boolean(farcaster))
      : [];

    const communities = buildCommunities(channels);

    const cultureScore = computeCultureScore(
      farcaster,
      basename,
      onchain?.isFounding ?? false,
    );

    const avatarUrl =
      farcaster?.pfpUrl || basename?.avatarUrl || null;

    const displayName = farcaster?.displayName || basename?.name || null;

    const status =
      farcaster || basename || onchain
        ? farcaster && basename
          ? "resolved"
          : "partial"
        : "empty";

    return {
      status,
      owner,
      farcaster,
      basename,
      holdings,
      badges,
      timeline,
      communities,
      cultureScore,
      followers: farcaster?.followerCount ?? 0,
      following: farcaster?.followingCount ?? 0,
      avatarUrl,
      displayName,
      accent: onchain?.isFounding || badges.some((b) => b.tier === "gold")
        ? "gold"
        : "primary",
      sources,
      warnings,
    };
  });
}
