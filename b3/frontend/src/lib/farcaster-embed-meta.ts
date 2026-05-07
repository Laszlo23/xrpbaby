import { getDropBySlug, type HomeDrop } from "@/content/home-drops";
import { loadMergedDropBySlug } from "@/lib/home-drops-merge";
import { getServerPublicOrigin } from "@/lib/app-origin";
import { getDefaultOgImageUrl, getOgImageForPath } from "@/lib/seo";

export type FarcasterMiniAppButton = {
  title: string;
  action: {
    type: "launch_miniapp" | "launch_frame";
    name: string;
    url: string;
    splashImageUrl?: string;
    splashBackgroundColor?: string;
  };
};

/**
 * Stringified JSON for meta name="fc:miniapp" and fc:frame (feed cards).
 * @see https://miniapps.farcaster.xyz/docs/guides/sharing
 */
export type FarcasterMiniAppMetaOptions = {
  /** Shown on the feed card button (keep short). */
  buttonTitle?: string;
  /** Mini app display name in the launch action. */
  miniAppName?: string;
};

export function buildFarcasterMiniAppMetaContent(
  homeUrl: string,
  imageUrl: string,
  options?: FarcasterMiniAppMetaOptions,
): string {
  const buttonTitle = (options?.buttonTitle ?? "Open").slice(0, 80);
  const miniAppName = options?.miniAppName ?? "BUILDCHAIN";
  const payload: {
    version: "1";
    imageUrl: string;
    button: FarcasterMiniAppButton;
  } = {
    version: "1",
    imageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_miniapp",
        name: miniAppName,
        url: homeUrl,
        splashBackgroundColor: "#0c0d12",
        splashImageUrl: imageUrl,
      },
    },
  };
  return JSON.stringify(payload);
}

/** Absolute OG/embed image for a drop (posters preferred; video covers fall back to site default). */
export function ogImageForHomeDrop(drop: HomeDrop | undefined): string {
  if (!drop) return getDefaultOgImageUrl();
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  const abs = (p: string) => (p.startsWith("/") ? `${origin}${p}` : `${origin}/${p}`);
  if (drop.posterImage?.startsWith("/")) return abs(drop.posterImage);
  if (drop.image.startsWith("/") && !/\.(mp4|webm|ogg)(\?|$)/i.test(drop.image)) {
    return abs(drop.image);
  }
  return getDefaultOgImageUrl();
}

export function absoluteDropOgImageUrl(slug: string): string {
  const drop = getDropBySlug(slug);
  return ogImageForHomeDrop(drop);
}

/**
 * Path-aware `fc:miniapp` / `fc:frame` JSON so casts open the right URL (drop story, campaign, or home).
 * Uses Strapi-merged drops when available.
 */
export async function buildPathAwareFarcasterEmbedMetaAsync(pathname: string): Promise<string> {
  const origin = farcasterEmbedLaunchOrigin().replace(/\/$/, "");
  const absFromPath = (path: string) => `${origin}${getOgImageForPath(path)}`;
  const defaultImg = getDefaultOgImageUrl();

  if (pathname.startsWith("/drops/")) {
    const slug = pathname.slice("/drops/".length).split("/")[0] ?? "";
    const drop = slug ? ((await loadMergedDropBySlug(slug)) ?? getDropBySlug(slug)) : undefined;
    const launchUrl = slug ? `${origin}/drops/${slug}` : `${origin}/`;
    const img = slug ? ogImageForHomeDrop(drop) : defaultImg;
    const btn = drop ? `Draw · ${drop.title}`.slice(0, 80) : "Enter draw";
    return buildFarcasterMiniAppMetaContent(launchUrl, img, { buttonTitle: btn });
  }

  if (pathname === "/campaign" || pathname.startsWith("/campaign/")) {
    return buildFarcasterMiniAppMetaContent(`${origin}/campaign`, absFromPath("/campaign"), {
      buttonTitle: "Agent shares & referrals",
    });
  }

  const pathForOg = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const homeUrl = `${origin}/`;
  return buildFarcasterMiniAppMetaContent(homeUrl, absFromPath(pathForOg || "/"), {
    buttonTitle: "Open",
  });
}

export function defaultFarcasterMetaImageUrl(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_FARCASTER_EMBED_IMAGE?.trim()) ||
    process.env.VITE_FARCASTER_EMBED_IMAGE?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const meta = (document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)
      ?.content;
    if (meta?.trim()) return meta.trim();
    return `${window.location.origin}/meta/home-meta.png`;
  }
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  return `${origin}/meta/home-meta.png`;
}

/** Origin used when building embed JSON on the server (matches manifest). */
export function farcasterEmbedLaunchOrigin(): string {
  return getServerPublicOrigin();
}
