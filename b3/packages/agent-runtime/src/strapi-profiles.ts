import { isAddress } from "viem";

export type CommunityProfileRow = {
  documentId: string;
  slug: string;
  displayName: string;
  ownerAddress: `0x${string}`;
};

/** Strapi v5 flat or nested `data` — normalize to owner addresses. */
export function parseStrapiCommunityProfiles(json: unknown): CommunityProfileRow[] {
  const root = json as { data?: unknown[] };
  const rows = Array.isArray(root?.data) ? root.data : [];
  const out: CommunityProfileRow[] = [];
  for (const item of rows) {
    const rec = item as Record<string, unknown>;
    const docId = (rec.documentId ?? rec.id) as string | undefined;
    const attrs = (rec.attributes ?? rec) as Record<string, unknown>;
    const slug = String(attrs.slug ?? "");
    const displayName = String(attrs.displayName ?? "");
    const owner = String(attrs.ownerAddress ?? "").trim();
    if (!docId || !slug || !isAddress(owner)) continue;
    out.push({
      documentId: String(docId),
      slug,
      displayName,
      ownerAddress: owner as `0x${string}`,
    });
  }
  return out;
}

export async function fetchCommunityProfiles(baseUrl: string, apiToken?: string): Promise<CommunityProfileRow[]> {
  const url = new URL("/api/community-profiles", baseUrl.replace(/\/$/, ""));
  url.searchParams.set("pagination[pageSize]", "100");
  url.searchParams.set("pagination[page]", "1");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiToken) headers.Authorization = `Bearer ${apiToken}`;
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`Strapi community-profiles HTTP ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  return parseStrapiCommunityProfiles(json);
}
