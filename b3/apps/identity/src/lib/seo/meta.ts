import {
  canonicalPath,
  DEFAULT_OG_IMAGE,
  profileUrl,
  SITE_NAME,
  TWITTER_SITE,
} from "./site";

export type MetaTag = Record<string, string>;

function canonicalLink(path: string): MetaTag {
  return { rel: "canonical", href: canonicalPath(path) };
}

function ogImageTags(image: string): MetaTag[] {
  return [
    { property: "og:image", content: image },
    { name: "twitter:image", content: image },
  ];
}

function baseSocialTags(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  twitterCard?: "summary" | "summary_large_image";
}): MetaTag[] {
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const card = opts.twitterCard ?? "summary_large_image";
  return [
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalPath(opts.path) },
    { name: "twitter:card", content: card },
    { name: "twitter:site", content: TWITTER_SITE },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    ...ogImageTags(image),
  ];
}

export function defaultMeta(): { meta: MetaTag[]; links: MetaTag[] } {
  const title = `${SITE_NAME} — Own your name. Own your future.`;
  const description =
    "Mint your onchain identity on Base. .culture, .build, .home, .eco — transferable identity NFTs.";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: "Building Culture" },
      ...baseSocialTags({ title, description, path: "/" }),
    ],
    links: [canonicalLink("/")],
  };
}

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): { meta: MetaTag[]; links: MetaTag[] } {
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      ...baseSocialTags({
        title: opts.title,
        description: opts.description,
        path: opts.path,
        image: opts.image,
      }),
    ],
    links: [canonicalLink(opts.path)],
  };
}

export function profileMetaClaimed(opts: {
  fullName: string;
  titleName: string;
  description: string;
  avatarUrl?: string | null;
  farcasterUsername?: string | null;
}): { meta: MetaTag[]; links: MetaTag[] } {
  const path = `/id/${opts.fullName}`;
  const title = `${opts.titleName} — ${SITE_NAME}`;
  const ogTitle = `${opts.fullName} · ${SITE_NAME} identity`;
  const image = opts.avatarUrl ?? DEFAULT_OG_IMAGE;
  const meta: MetaTag[] = [
    { title },
    { name: "description", content: opts.description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: profileUrl(opts.fullName) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_SITE },
    { name: "twitter:title", content: opts.farcasterUsername ? `@${opts.farcasterUsername} · ${opts.fullName}` : ogTitle },
    { name: "twitter:description", content: opts.description },
    ...ogImageTags(image),
  ];
  return {
    meta,
    links: [canonicalLink(path)],
  };
}

export function profileMetaUnclaimed(fullName: string): { meta: MetaTag[]; links: MetaTag[] } {
  const path = `/id/${fullName}`;
  const title = `${fullName} — available · ${SITE_NAME}`;
  const description = `This identity is available to mint on Base. Claim ${fullName} on ${SITE_NAME}.`;
  return pageMeta({ title, description, path });
}

export function faviconLinks(): MetaTag[] {
  return [
    { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  ];
}
