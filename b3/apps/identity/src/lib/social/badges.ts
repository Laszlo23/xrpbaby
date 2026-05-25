import type { OnchainIdentity } from "@/lib/chain/identityContract";
import type { FarcasterProfile, ResolvedName, SocialBadge } from "./types";

export function buildEarnedBadges(
  onchain: OnchainIdentity,
  farcaster: FarcasterProfile | null,
  basename: ResolvedName | null,
): SocialBadge[] {
  const badges: SocialBadge[] = [];

  if (onchain.isFounding) {
    badges.push({
      id: "founding",
      label: "Founding member",
      tier: "gold",
      desc: "Among the first 5,000 identities on Culture Layer.",
    });
  }

  if (farcaster) {
    badges.push({
      id: "farcaster",
      label: "Farcaster native",
      tier: "primary",
      desc: `@${farcaster.username} linked via verified wallet.`,
    });

    for (const v of farcaster.verifiedAccounts) {
      const platform = v.platform.toLowerCase();
      if (platform.includes("x") || platform.includes("twitter")) {
        badges.push({
          id: "verified-x",
          label: "Verified on X",
          tier: "primary",
          desc: `@${v.username} verified on Farcaster.`,
        });
      }
      if (platform.includes("github")) {
        badges.push({
          id: "verified-github",
          label: "GitHub verified",
          tier: "primary",
          desc: `${v.username} on GitHub.`,
        });
      }
    }
  }

  if (basename) {
    badges.push({
      id: "basename",
      label: basename.type === "basename" ? "Basename" : "ENS",
      tier: "gold",
      desc: `Resolved as ${basename.name}.`,
    });
  }

  return badges;
}

export function computeCultureScore(
  farcaster: FarcasterProfile | null,
  basename: ResolvedName | null,
  isFounding: boolean,
): number {
  let score = 0;
  if (farcaster) {
    score += Math.min(farcaster.followerCount, 50_000);
    score += Math.min(farcaster.followingCount, 5_000);
    score += farcaster.verifiedAccounts.length * 250;
  }
  if (basename) score += 500;
  if (isFounding) score += 2_000;
  return score;
}
