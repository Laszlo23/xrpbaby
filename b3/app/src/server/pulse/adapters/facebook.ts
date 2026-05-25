import { envFlag } from "../config";
import type { IngestItem, PulseIngestAdapter } from "../types";

type GraphPost = {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
  likes?: { summary?: { total_count?: number } };
  comments?: { summary?: { total_count?: number } };
};

export class FacebookPulseAdapter implements PulseIngestAdapter {
  readonly platform = "facebook" as const;

  isEnabled(): boolean {
    if (!envFlag("FACEBOOK_STREAM")) return false;
    return Boolean(
      process.env.FACEBOOK_ACCESS_TOKEN?.trim() &&
        process.env.FACEBOOK_PAGE_ID?.trim(),
    );
  }

  async ingest(since: Date): Promise<IngestItem[]> {
    if (!this.isEnabled()) return [];

    const token = process.env.FACEBOOK_ACCESS_TOKEN!.trim();
    const pageId = process.env.FACEBOOK_PAGE_ID!.trim();
    const url = new URL(`https://graph.facebook.com/v21.0/${pageId}/posts`);
    url.searchParams.set(
      "fields",
      "id,message,created_time,permalink_url,likes.summary(true),comments.summary(true)",
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "25");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn("[pulse] facebook:", res.status, await res.text());
        return [];
      }
      const json = (await res.json()) as { data?: GraphPost[] };
      return (json.data ?? [])
        .filter((p) => new Date(p.created_time) >= since)
        .map((p) => ({
          platform: "facebook" as const,
          externalId: p.id,
          authorHandle: pageId,
          content: p.message ?? "",
          permalink: p.permalink_url,
          metrics: {
            likes: p.likes?.summary?.total_count ?? 0,
            comments: p.comments?.summary?.total_count ?? 0,
          },
          publishedAt: new Date(p.created_time),
        }));
    } catch (e) {
      console.warn("[pulse] facebook ingest:", e instanceof Error ? e.message : e);
      return [];
    }
  }
}
