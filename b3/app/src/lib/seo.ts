/**
 * Central SEO + Open Graph + Twitter metadata for TanStack Router `head`.
 */
import { getServerPublicOrigin } from "@/lib/app-origin";
import { BLOG_SLUGS } from "@/content/blog/markdown-posts";
import { BUILDER_TAPES, builderTapeEpisodePath } from "@/content/builder-tapes";
import { homeDrops } from "@/content/home-drops";
import { CHRONICLES } from "@/content/culture-chronicles";
import { MARKETPLACE_SERVICES } from "@/content/marketplace-services";
import {
  farcasterFollowProfileUrl,
  communityTelegramUrl,
  communityXUrl,
} from "@/lib/community-links";
import { LANDING_NORTH_STAR, LANDING_TAGLINE, PILLAR_PRODUCTS } from "@/lib/landing-copy";
import { LANDING_SOCIAL } from "@/lib/landing-media";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const SEO_SITE_NAME = BRAND_DISPLAY_NAME;

const TITLE_SUFFIX = ` — ${SEO_SITE_NAME}`;

/** Talent Protocol / Builder Rewards — domain verification (homepage <head>). */
export const TALENTAPP_PROJECT_VERIFICATION =
  "e960f18a1356b6f99de376cde74522d2a12215e74741b1cfd909876bfdf5c22e69a0ec4049043ef69795e249624cf583c5589aa671635e00fffcd6bd1fb266ee";

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
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  /** Use noindex for dashboards / drafts */
  noIndex?: boolean;
  /** Additional `<meta name=… content=…>` tags (grant smoke, verification). */
  extraMeta?: Array<{ name: string; content: string }>;
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

/** Site-relative OG PNG for social crawlers (Twitter, LinkedIn, Farcaster). */
export function getOgImageForPath(path: string): string {
  const p = normalizeCanonicalPath(path.split("?")[0]);
  if (p === "/play" || p === "/mission") return "/meta/eco-meta-og.png";
  if (
    p.startsWith("/marketplace") ||
    p.startsWith("/campaign") ||
    p === "/profile" ||
    p.startsWith("/profile/") ||
    p === "/agent-fleet" ||
    p === "/collections" ||
    p.startsWith("/chronicles") ||
    p === "/leaderboard" ||
    p === "/admin" ||
    p === "/presale" ||
    p === "/guide" ||
    p === "/elias" ||
    p === "/faq" ||
    p === "/about" ||
    p === "/grant-proof" ||
    p === "/voice"
  ) {
    return "/meta/0xmeta-og.png";
  }
  return "/meta/home-meta-og.png";
}

export function getDefaultOgImageUrl(): string {
  const env = ogImageEnvOverride();
  if (env) return env;
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  return `${origin}/meta/home-meta-og.png`;
}

/** Preconnect + non-blocking font stylesheets (avoid CSS @import). */
export function rootFontPreconnectLinks(): HeadPayload["links"] {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "preconnect", href: "https://api.fontshare.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap",
    },
  ];
}

/** Favicon, PWA manifest, and app icon links for root `<head>`. */
export function rootIconLinks(): HeadPayload["links"] {
  return [
    { rel: "icon", href: "/favicon-32.png", type: "image/png", crossOrigin: "anonymous" },
    { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/manifest.webmanifest" },
  ];
}

/** iOS Add to Home Screen + installability hints (merged in rootTechnicalMeta). */
export function rootPwaMeta(): HeadPayload["meta"] {
  return [
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "apple-mobile-web-app-title", content: "Building Culture" },
    { name: "application-name", content: "Building Culture" },
  ];
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
    type?: string;
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
    opts.title.includes(SEO_SITE_NAME) ||
    opts.title.includes("Building Culture") ||
    opts.title.includes("BUILDCHAIN")
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
  const articleMeta =
    ogType === "article"
      ? [
          ...(opts.articlePublishedTime
            ? [{ property: "article:published_time", content: opts.articlePublishedTime }]
            : []),
          ...(opts.articleModifiedTime
            ? [{ property: "article:modified_time", content: opts.articleModifiedTime }]
            : []),
        ]
      : [];

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
      content: `${SEO_SITE_NAME} — ${opts.title.replace(/\s*—\s*(BUILDCHAIN|Build(?:ing)? Culture)\s*$/i, "").trim()}`,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: titleTag },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: imageUrl },
    ...articleMeta,
    ...(twitterSite ? [{ name: "twitter:site", content: twitterSite }] : []),
    ...(opts.extraMeta ?? []),
  ];

  if (keywords) {
    meta.splice(2, 0, { name: "keywords", content: keywords });
  }

  const links: HeadPayload["links"] = [
    ...rootFontPreconnectLinks(),
    ...rootIconLinks(),
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
    ...rootPwaMeta(),
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
  meta.push({
    name: "virtual-protocol-site-verification",
    content: "e2ae20e90285236d3323c610d2e1f914",
  });
  meta.push({
    name: "talentapp:project_verification",
    content: TALENTAPP_PROJECT_VERIFICATION,
  });
  return meta;
}

/** Structured data graph for Building Culture — Organization, site, and product ecosystem. */
export function buildWebsiteJsonLd(): Record<string, unknown> {
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  const logo = getDefaultOgImageUrl();
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const sameAs = Array.from(
    new Set(
      [
        communityXUrl(),
        communityTelegramUrl(),
        farcasterFollowProfileUrl(),
        LANDING_SOCIAL.discord,
        LANDING_SOCIAL.x,
        LANDING_SOCIAL.telegram,
      ].filter(Boolean),
    ),
  );

  const productItems = [
    ...PILLAR_PRODUCTS.map((product) => ({
      name: product.name,
      url: `${origin}${product.productPageHref}`,
      description: product.tagline,
    })),
    {
      name: "Grant Proof",
      url: `${origin}/products/grant-proof`,
      description: "Transparent proof of impact for grants, donations, and milestones.",
    },
    {
      name: "Campaign Hub",
      url: `${origin}/products/campaign-hub`,
      description: "Launch quests, campaigns, and community growth loops.",
    },
    {
      name: "AI Agents",
      url: `${origin}/products/ai-agents`,
      description: "Agent fleet for growth, delivery, and onchain operations.",
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SEO_SITE_NAME,
        alternateName: ["Build Culture", "BUILDCHAIN"],
        url: origin,
        logo: { "@type": "ImageObject", url: logo },
        description: LANDING_NORTH_STAR,
        slogan: LANDING_TAGLINE,
        sameAs,
        knowsAbout: [
          "community ownership",
          "Web3 reputation",
          "onchain credentials",
          "real estate tokenization",
          "AI agents",
          "Base blockchain",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SEO_SITE_NAME,
        url: origin,
        description: LANDING_NORTH_STAR,
        inLanguage: "en-US",
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": `${origin}/#homepage`,
        url: origin,
        name: `${SEO_SITE_NAME} — The Home of Community-Owned Growth`,
        description: LANDING_NORTH_STAR,
        isPartOf: { "@id": websiteId },
        about: { "@id": orgId },
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${origin}/#ecosystem`,
        name: "Building Culture Products",
        description:
          "Culture ID, credentials, reputation, access, campaigns, grant proof, and AI agents on Base.",
        itemListElement: productItems.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            name: product.name,
            url: product.url,
            description: product.description,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
        })),
      },
    ],
  };
}

export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  path: string;
  priority: number;
  changefreq: SitemapChangeFreq;
};

function sitemapEntry(
  path: string,
  opts: Partial<Pick<SitemapEntry, "priority" | "changefreq">> = {},
): SitemapEntry {
  return {
    path,
    priority: opts.priority ?? 0.85,
    changefreq: opts.changefreq ?? "weekly",
  };
}

const blogPaths = BLOG_SLUGS.map((slug) => `/blog/${slug}`);
const dropPaths = homeDrops.map((d) => `/drops/${d.slug}`);
const chroniclePaths = CHRONICLES.map((c) => `/chronicles/${c.id}`);

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

/** Indexable routes with crawl hints for Google Search Console. */
export function buildSitemapEntries(): SitemapEntry[] {
  const builderTapePaths = BUILDER_TAPES.map((tape) => builderTapeEpisodePath(tape.slug));
  const marketplaceServicePaths = MARKETPLACE_SERVICES.map(
    (s) => `/marketplace/services/${s.slug}`,
  );

  return [
    sitemapEntry("/", { priority: 1.0, changefreq: "daily" }),
    sitemapEntry("/join", { priority: 0.95, changefreq: "weekly" }),
    sitemapEntry("/pass", { priority: 0.95, changefreq: "weekly" }),
    sitemapEntry("/products", { priority: 0.95, changefreq: "weekly" }),
    sitemapEntry("/products/culture-id", { priority: 0.92, changefreq: "weekly" }),
    sitemapEntry("/products/campaign-hub", { priority: 0.9, changefreq: "weekly" }),
    sitemapEntry("/products/ai-agents", { priority: 0.9, changefreq: "weekly" }),
    sitemapEntry("/products/grant-proof", { priority: 0.9, changefreq: "weekly" }),
    sitemapEntry("/credentials", { priority: 0.9, changefreq: "weekly" }),
    sitemapEntry("/credentials/leaderboard", { priority: 0.75, changefreq: "daily" }),
    sitemapEntry("/ecosystem", { priority: 0.9, changefreq: "weekly" }),
    sitemapEntry("/how-we-partner", { priority: 0.88, changefreq: "monthly" }),
    sitemapEntry("/investors", { priority: 0.88, changefreq: "monthly" }),
    sitemapEntry("/investors/workshop", { priority: 0.7, changefreq: "monthly" }),
    sitemapEntry("/about", { priority: 0.85, changefreq: "monthly" }),
    sitemapEntry("/team", { priority: 0.8, changefreq: "monthly" }),
    sitemapEntry("/faq", { priority: 0.85, changefreq: "monthly" }),
    sitemapEntry("/mission", { priority: 0.85, changefreq: "monthly" }),
    sitemapEntry("/roadmap", { priority: 0.85, changefreq: "monthly" }),
    sitemapEntry("/plan", { priority: 0.8, changefreq: "monthly" }),
    sitemapEntry("/story", { priority: 0.82, changefreq: "monthly" }),
    sitemapEntry("/grant-proof", { priority: 0.85, changefreq: "weekly" }),
    sitemapEntry("/play", { priority: 0.88, changefreq: "weekly" }),
    sitemapEntry("/forest", { priority: 0.85, changefreq: "weekly" }),
    sitemapEntry("/forest/quests", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/forest/grove", { priority: 0.75, changefreq: "weekly" }),
    sitemapEntry("/marketplace", { priority: 0.88, changefreq: "weekly" }),
    sitemapEntry("/marketplace/services", { priority: 0.85, changefreq: "weekly" }),
    ...marketplaceServicePaths.map((path) =>
      sitemapEntry(path, { priority: 0.8, changefreq: "monthly" }),
    ),
    sitemapEntry("/campaign", { priority: 0.82, changefreq: "weekly" }),
    sitemapEntry("/collections", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/experiences", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/liquidity", { priority: 0.78, changefreq: "weekly" }),
    sitemapEntry("/swap", { priority: 0.75, changefreq: "weekly" }),
    sitemapEntry("/bridge/bcc", { priority: 0.75, changefreq: "monthly" }),
    sitemapEntry("/bcc/fair-launch", { priority: 0.78, changefreq: "weekly" }),
    sitemapEntry("/presale", { priority: 0.75, changefreq: "weekly" }),
    sitemapEntry("/wallet", { priority: 0.88, changefreq: "weekly" }),
    sitemapEntry("/wallet/packs", { priority: 0.86, changefreq: "weekly" }),
    sitemapEntry("/billing", { priority: 0.82, changefreq: "weekly" }),
    sitemapEntry("/trading-agent", { priority: 0.78, changefreq: "weekly" }),
    sitemapEntry("/leaderboard", { priority: 0.78, changefreq: "daily" }),
    sitemapEntry("/genesis-district", { priority: 0.8, changefreq: "monthly" }),
    sitemapEntry("/agent-fleet", { priority: 0.82, changefreq: "weekly" }),
    sitemapEntry("/agent-os", { priority: 0.75, changefreq: "weekly" }),
    sitemapEntry("/profile", { priority: 0.75, changefreq: "weekly" }),
    sitemapEntry("/guide", { priority: 0.78, changefreq: "monthly" }),
    sitemapEntry("/elias", { priority: 0.78, changefreq: "monthly" }),
    sitemapEntry("/voice", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/creators", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/connect", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/studio", { priority: 0.78, changefreq: "weekly" }),
    sitemapEntry("/hq", { priority: 0.75, changefreq: "monthly" }),
    sitemapEntry("/triple-333", { priority: 0.72, changefreq: "monthly" }),
    sitemapEntry("/roots", { priority: 0.72, changefreq: "monthly" }),
    sitemapEntry("/welcome", { priority: 0.8, changefreq: "monthly" }),
    sitemapEntry("/explorer", { priority: 0.78, changefreq: "weekly" }),
    sitemapEntry("/chronicles", { priority: 0.85, changefreq: "monthly" }),
    ...chroniclePaths.map((path) => sitemapEntry(path, { priority: 0.75, changefreq: "monthly" })),
    sitemapEntry("/stories/tapes", { priority: 0.82, changefreq: "weekly" }),
    ...builderTapePaths.map((path) =>
      sitemapEntry(path, { priority: 0.75, changefreq: "monthly" }),
    ),
    sitemapEntry("/bcid", { priority: 0.8, changefreq: "weekly" }),
    sitemapEntry("/bcid/mint", { priority: 0.78, changefreq: "weekly" }),
    sitemapEntry("/bcid/leaderboard", { priority: 0.75, changefreq: "daily" }),
    sitemapEntry("/blog", { priority: 0.85, changefreq: "weekly" }),
    ...blogPaths.map((path) => sitemapEntry(path, { priority: 0.72, changefreq: "monthly" })),
    ...dropPaths.map((path) => sitemapEntry(path, { priority: 0.7, changefreq: "monthly" })),
    ...profileSitemapPaths().map((path) =>
      sitemapEntry(path, { priority: 0.65, changefreq: "weekly" }),
    ),
    sitemapEntry("/docs", { priority: 0.78, changefreq: "monthly" }),
    sitemapEntry("/docs/bcid", { priority: 0.72, changefreq: "monthly" }),
    sitemapEntry("/docs/interop", { priority: 0.72, changefreq: "monthly" }),
    sitemapEntry("/docs/rfc", { priority: 0.72, changefreq: "monthly" }),
    sitemapEntry("/chatbase", { priority: 0.65, changefreq: "monthly" }),
    sitemapEntry("/legal/terms", { priority: 0.4, changefreq: "yearly" }),
    sitemapEntry("/legal/privacy", { priority: 0.4, changefreq: "yearly" }),
    sitemapEntry("/legal/imprint", { priority: 0.4, changefreq: "yearly" }),
    sitemapEntry("/legal/cookies", { priority: 0.4, changefreq: "yearly" }),
  ];
}

/** Flat path list — kept for callers that only need URLs. */
export const SITEMAP_PATHS: string[] = buildSitemapEntries().map((entry) => entry.path);

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
