/**
 * Central SEO + Open Graph + Twitter metadata for TanStack Router `head`.
 */
import { getServerPublicOrigin } from "@/lib/app-origin";
import { BLOG_SLUGS } from "@/content/blog/posts";
import { homeDrops } from "@/content/home-drops";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const SEO_SITE_NAME = BRAND_DISPLAY_NAME;

const TITLE_SUFFIX = ` — ${SEO_SITE_NAME}`;

export type PageSeoInput = {
  /** Page-specific title (shown as `{title} — Build Culture` unless title already includes the site name). */
  title: string;
  /** ~155 chars recommended; truncated server-side for safety. */
  description: string;
  /** Path including leading slash, e.g. `/faq`. */
  path: string;
  /** Absolute HTTPS URL or site-relative path for OG/Twitter image. */
  image?: string;
  keywords?: string[];
  ogType?: "website" | "article";
  /** Use noindex for dashboards / drafts */
  noIndex?: boolean;
};

/** Optional global OG overrides (still wins under per-route `image` in `pageHead`). */
export function ogImageEnvOverride(): string | undefined {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_OG_IMAGE_URL?.trim()) ||
    process.env.VITE_OG_IMAGE_URL?.trim() ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_FARCASTER_EMBED_IMAGE?.trim()) ||
    process.env.VITE_FARCASTER_EMBED_IMAGE?.trim()
  );
}

/** Site-relative OG assets under `/public/meta/` (see `getOgImageForPath`). */
export function getOgImageForPath(path: string): string {
  const p = normalizeCanonicalPath(path.split("?")[0]);
  if (p === "/play" || p === "/mission") return "/meta/eco-meta.png";
  if (
    p.startsWith("/marketplace") ||
    p.startsWith("/campaign") ||
    p === "/profile" ||
    p.startsWith("/profile/") ||
    p === "/agent-fleet" ||
    p === "/collections" ||
    p === "/leaderboard" ||
    p === "/admin"
  ) {
    return "/meta/0xmeta.png";
  }
  return "/meta/home-meta.png";
}

export function getDefaultOgImageUrl(): string {
  const env = ogImageEnvOverride();
  if (env) return env;
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  return `${origin}/meta/home-meta.png`;
}

export function getTwitterSiteHandle(): string | undefined {
  const h =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_TWITTER_SITE?.trim()) ||
    process.env.VITE_TWITTER_SITE?.trim();
  if (!h) return undefined;
  return h.startsWith("@") ? h : `@${h}`;
}

function truncateMetaDescription(s: string, max = 158): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function normalizeCanonicalPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.replace(/\/+$/, "") || "/";
}

function absolutizeImage(image: string, origin: string): string {
  const t = image.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `${origin}${t.startsWith("/") ? t : `/${t}`}`;
}

export type HeadPayload = {
  meta: Array<
    | { title: string }
    | { charSet: string }
    | { name: string; content: string }
    | { property: string; content: string }
    | { httpEquiv: string; content: string }
  >;
  links: Array<{
    rel: string;
    href: string;
    /** React `<link>` uses camelCase; renders as `hreflang` in HTML. */
    hrefLang?: string;
    crossOrigin?: "anonymous";
  }>;
};

/** Single-language site: en + x-default point at the canonical URL (hreflang best practice). */
export function hreflangAlternateLinks(canonicalUrl: string): HeadPayload["links"] {
  return [
    { rel: "alternate", hrefLang: "en", href: canonicalUrl },
    { rel: "alternate", hrefLang: "x-default", href: canonicalUrl },
  ];
}

/**
 * Full per-route metadata: canonical, OG, Twitter, robots — aligned with each other.
 */
export function pageHead(opts: PageSeoInput): HeadPayload {
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  const canonicalPath = normalizeCanonicalPath(opts.path);
  const canonicalUrl = `${origin}${canonicalPath === "/" ? "" : canonicalPath}`;
  const titleTag =
    opts.title.includes(SEO_SITE_NAME) || opts.title.includes("BUILDCHAIN")
      ? opts.title
      : `${opts.title}${TITLE_SUFFIX}`;
  const desc = truncateMetaDescription(opts.description);
  const imageUrl = absolutizeImage(
    opts.image ?? ogImageEnvOverride() ?? getOgImageForPath(canonicalPath),
    origin,
  );
  const ogType = opts.ogType ?? "website";
  const robots = opts.noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const twitterSite = getTwitterSiteHandle();
  const keywords =
    opts.keywords?.length && opts.keywords.length > 0 ? opts.keywords.join(", ") : undefined;

  const meta: HeadPayload["meta"] = [
    { title: titleTag },
    { name: "description", content: desc },
    { name: "robots", content: robots },
    { name: "author", content: SEO_SITE_NAME },
    { name: "creator", content: SEO_SITE_NAME },
    { name: "publisher", content: SEO_SITE_NAME },
    { property: "og:title", content: titleTag },
    { property: "og:description", content: desc },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: ogType },
    { property: "og:site_name", content: SEO_SITE_NAME },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: imageUrl },
    { property: "og:image:secure_url", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    {
      property: "og:image:alt",
      content: `${SEO_SITE_NAME} — ${opts.title.replace(/\s*—\s*(BUILDCHAIN|Build Culture)\s*$/i, "").trim()}`,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: titleTag },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: imageUrl },
    ...(twitterSite ? [{ name: "twitter:site", content: twitterSite }] : []),
  ];

  if (keywords) {
    meta.splice(2, 0, { name: "keywords", content: keywords });
  }

  const links: HeadPayload["links"] = [
    { rel: "canonical", href: canonicalUrl },
    ...hreflangAlternateLinks(canonicalUrl),
  ];

  return { meta, links };
}

/** Global `<head>` entries merged on every page (charset, viewport, theme, Farcaster embed). */
export function rootTechnicalMeta(): HeadPayload["meta"] {
  const theme =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_THEME_COLOR?.trim()) ||
    process.env.VITE_THEME_COLOR?.trim() ||
    "#0c0d12";
  const baseAppId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_BASE_APP_ID?.trim()) ||
    process.env.VITE_BASE_APP_ID?.trim() ||
    "69ec135e8502c283edbf9428";

  const meta: HeadPayload["meta"] = [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    { name: "theme-color", content: theme },
    { name: "color-scheme", content: "dark" },
    { name: "format-detection", content: "telephone=no" },
    { name: "referrer", content: "strict-origin-when-cross-origin" },
    { name: "base:app_id", content: baseAppId },
  ];
  const google =
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_GOOGLE_SITE_VERIFICATION?.trim()) ||
    process.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  if (google) {
    meta.push({ name: "google-site-verification", content: google });
  }
  const bing =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MS_VALIDATE?.trim()) ||
    process.env.VITE_MS_VALIDATE?.trim();
  if (bing) {
    meta.push({ name: "msvalidate.01", content: bing });
  }
  return meta;
}

/** Routes we advertise in sitemap.xml (marketing + indexable). */
export function buildWebsiteJsonLd(): Record<string, unknown> {
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  const logo = getDefaultOgImageUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: SEO_SITE_NAME,
        url: origin,
        logo: { "@type": "ImageObject", url: logo },
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: SEO_SITE_NAME,
        url: origin,
        inLanguage: "en-US",
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  };
}

const blogPaths = BLOG_SLUGS.map((slug) => `/blog/${slug}`);
const dropPaths = homeDrops.map((d) => `/drops/${d.slug}`);

/** Optional: comma-separated community profile slugs to surface in sitemap (e.g. featured creators). */
function profileSitemapPaths(): string[] {
  const raw =
    (typeof process !== "undefined" && process.env.PROFILE_SITEMAP_SLUGS?.trim()) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_PROFILE_SITEMAP_SLUGS?.trim()) ||
    "";
  if (!raw) return [];
  return raw
    .split(",")
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((slug: string) => `/p/${slug}`);
}

export const SITEMAP_PATHS: string[] = [
  "/",
  "/about",
  "/team",
  "/faq",
  "/mission",
  "/roadmap",
  "/campaign",
  "/collections",
  "/marketplace",
  "/experiences",
  "/investors",
  "/leaderboard",
  "/play",
  "/genesis-district",
  "/agent-fleet",
  "/profile",
  "/docs",
  "/blog",
  ...blogPaths,
  ...dropPaths,
  ...profileSitemapPaths(),
  "/legal/terms",
  "/legal/privacy",
  "/legal/imprint",
  "/legal/cookies",
];
