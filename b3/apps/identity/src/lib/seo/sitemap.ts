import { parseAbiItem } from "viem";
import { cultureLayerIdentityAbi } from "@/lib/contracts/identityAbi";
import {
  identityContractAddress,
  isContractConfigured,
} from "@/lib/chain/config";
import { publicClient } from "@/lib/chain/publicClient";
import { tldIdToLabel } from "@/lib/chain/tlds";
import { absoluteUrl, SITE_ORIGIN } from "./site";

const MAX_PROFILE_URLS = 5000;
/** Base mainnet deploy block for CultureLayerIdentity (second deploy). */
const CONTRACT_DEPLOY_BLOCK = 46_074_520n;

const identityMintedEvent = parseAbiItem(
  "event IdentityMinted(address indexed minter, uint256 indexed tokenId, string handle, uint8 tldId, bool isFounding)",
);

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function staticSitemapUrls(): SitemapUrl[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { loc: absoluteUrl("/"), lastmod: today },
    { loc: absoluteUrl("/terms"), lastmod: today },
    { loc: absoluteUrl("/privacy"), lastmod: today },
  ];
}

export async function fetchMintedProfileUrls(): Promise<SitemapUrl[]> {
  if (!isContractConfigured) return [];

  const logs = await publicClient.getLogs({
    address: identityContractAddress,
    event: identityMintedEvent,
    fromBlock: CONTRACT_DEPLOY_BLOCK,
    toBlock: "latest",
  });

  const seen = new Set<string>();
  const urls: SitemapUrl[] = [];

  for (const log of logs) {
    if (urls.length >= MAX_PROFILE_URLS) break;
    const handle = log.args.handle as string | undefined;
    const tldId = log.args.tldId as number | undefined;
    if (!handle || tldId === undefined) continue;
    const tld = tldIdToLabel(tldId);
    if (!tld) continue;
    const fullName = `${handle.toLowerCase()}.${tld}`;
    if (seen.has(fullName)) continue;
    seen.add(fullName);
    urls.push({
      loc: `${SITE_ORIGIN}/id/${encodeURIComponent(fullName)}`,
    });
  }

  return urls;
}

export async function buildFullSitemap(): Promise<string> {
  const [staticUrls, profileUrls] = await Promise.all([
    Promise.resolve(staticSitemapUrls()),
    fetchMintedProfileUrls(),
  ]);
  return buildSitemapXml([...staticUrls, ...profileUrls]);
}
