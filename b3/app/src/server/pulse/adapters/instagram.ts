import { envFlag } from "../config";
import type { IngestItem, PulseIngestAdapter } from "../types";

type IgMedia = {
  id: string;
  caption?: string;
  timestamp: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
};

export class InstagramPulseAdapter implements PulseIngestAdapter {
  readonly platform = "instagram" as const;

  isEnabled(): boolean {
    if (!envFlag("INSTAGRAM_STREAM")) return false;
    return Boolean(
      process.env.FACEBOOK_ACCESS_TOKEN?.trim() &&
        process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim(),
    );
  }

  async ingest(since: Date): Promise<IngestItem[]> {
    if (!this.isEnabled()) return [];

    const token = process.env.FACEBOOK_ACCESS_TOKEN!.trim();
    const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!.trim();
    const url = new URL(`https://graph.facebook.com/v21.0/${igUserId}/media`);
    url.searchParams.set(
      "fields",
      "id,caption,timestamp,permalink,like_count,comments_count",
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "25");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn("[pulse] instagram:", res.status, await res.text());
        return [];
      }
      const json = (await res.json()) as { data?: IgMedia[] };
      return (json.data ?? [])
        .filter((m) => new Date(m.timestamp) >= since)
        .map((m) => ({
          platform: "instagram" as const,
          externalId: m.id,
          authorHandle: igUserId,
          content: m.caption ?? "",
          permalink: m.permalink,
          metrics: {
            likes: m.like_count ?? 0,
            comments: m.comments_count ?? 0,
          },
          publishedAt: new Date(m.timestamp),
        }));
    } catch (e) {
      console.warn("[pulse] instagram ingest:", e instanceof Error ? e.message : e);
      return [];
    }
  }
}
