/**
 * /.well-known/farcaster.json manifest — Mini App publishing metadata.
 * @see https://miniapps.farcaster.xyz/docs/guides/publishing
 */
import { getServerPublicOrigin } from "@/lib/app-origin";

export function buildFarcasterManifest(): Record<string, unknown> {
  const origin = getServerPublicOrigin();
  const homeUrl = `${origin}/`;
  const defaultIcon = `${origin}/brand/miniapp-icon.svg`;
  const defaultOg = `${origin}/meta/home-meta.png`;
  const iconUrl = process.env.FARCASTER_ICON_URL?.trim() || defaultIcon;
  const ogImage = process.env.FARCASTER_OG_IMAGE_URL?.trim() || defaultOg;

  return {
    miniapp: {
      version: "1",
      name: process.env.FARCASTER_APP_NAME?.trim() || "BUILDCHAIN",
      iconUrl,
      homeUrl,
      splashImageUrl: iconUrl,
      splashBackgroundColor: "#0c0d12",
      subtitle: process.env.FARCASTER_APP_SUBTITLE?.trim() || "Onchain RWA builder game",
      description:
        process.env.FARCASTER_APP_DESCRIPTION?.trim() ||
        "Collect tokenized tickets. Win real-world assets. Built on Base.",
      heroImageUrl: ogImage,
      tagline: process.env.FARCASTER_APP_TAGLINE?.trim() || "Culture on-chain",
      ogTitle: process.env.FARCASTER_APP_NAME?.trim() || "BUILDCHAIN",
      ogDescription:
        process.env.FARCASTER_APP_DESCRIPTION?.trim() ||
        "Fair raffle tickets for real-world stays, art, and experiences.",
      ogImageUrl: ogImage,
      primaryCategory: "games",
      tags: [
        "base",
        "nft",
        "rwa",
        "builder",
        "leaderboard",
        "quests",
        "telegram",
        "twitter",
        "farcaster",
      ],
      requiredChains: ["eip155:56", "eip155:8453"],
    },
  };
}
