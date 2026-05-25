import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/blog";
import { DEMO_PROPERTY_DETAILS } from "@/lib/demo-properties";
import { PUBLIC_DOCUMENTS } from "@/lib/public-documents";
import { getSiteUrl } from "@/lib/site-url";

/** Marketing and product routes we want discoverable (excludes authenticated-only shells where applicable). */
const STATIC_PATHS: string[] = [
  "/",
  "/start",
  "/onboarding",
  "/experience",
  "/how-it-works",
  "/guide",
  "/mission",
  "/properties",
  "/culture-land",
  "/community",
  "/portfolio",
  "/trade",
  "/pool",
  "/lend",
  "/stake",
  "/invest",
  "/markets",
  "/market",
  "/build-with-us",
  "/roadmap",
  "/team",
  "/transparency",
  "/feedback",
  "/guestbook",
  "/blog",
  "/contracts",
  "/documents",
  "/issuer",
  "/kyc",
  "/profile",
  "/legal",
  "/legal/risk",
  "/legal/terms",
  "/legal/privacy",
  "/legal/offerings",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/start" || path === "/properties" ? 0.95 : 0.8,
  }));

  const propertyIds = Object.keys(DEMO_PROPERTY_DETAILS)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const propertyEntries: MetadataRoute.Sitemap = propertyIds.map((id) => ({
    url: `${base}/properties/${id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: id === 1 ? 0.9 : 0.75,
  }));

  const posts = listBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${encodeURIComponent(p.slug)}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const documentEntries: MetadataRoute.Sitemap = PUBLIC_DOCUMENTS.map((doc) => ({
    url: `${base}/documents/${doc.id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...propertyEntries, ...blogEntries, ...documentEntries];
}
