import { listBlogPostsSorted } from "@/content/blog/markdown-posts";
import { getServerPublicOrigin } from "@/lib/app-origin";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function blogRssResponse(): Response {
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  const siteUrl = `${origin}/blog`;
  const posts = listBlogPostsSorted().slice(0, 50);

  const itemsXml = posts
    .map((post) => {
      const link = `${origin}/blog/${post.slug}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(link)}</link>`,
        `<guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
        `<description>${escapeXml(post.excerpt)}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0">` +
    `<channel>` +
    `<title>BUILDCHAIN Blog</title>` +
    `<link>${escapeXml(siteUrl)}</link>` +
    `<description>Daily BUILDCHAIN updates, playbooks, and product notes.</description>` +
    `<language>en-us</language>` +
    itemsXml +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
