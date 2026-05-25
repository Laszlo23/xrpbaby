import { envFlag } from "../config";
import type { IngestItem, PulseIngestAdapter } from "../types";

type TikTokVideo = {
  id: string;
  title?: string;
  create_time: number;
  share_url?: string;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
};

export class TikTokPulseAdapter implements PulseIngestAdapter {
  readonly platform = "tiktok" as const;

  isEnabled(): boolean {
    if (!envFlag("TIKTOK_STREAM")) return false;
    return Boolean(
      process.env.TIKTOK_ACCESS_TOKEN?.trim() &&
        process.env.TIKTOK_OPEN_ID?.trim(),
    );
  }

  async ingest(since: Date): Promise<IngestItem[]> {
    if (!this.isEnabled()) return [];

    const token = process.env.TIKTOK_ACCESS_TOKEN!.trim();
    const openId = process.env.TIKTOK_OPEN_ID!.trim();
    const url = new URL("https://open.tiktokapis.com/v2/video/list/");
    url.searchParams.set("fields", "id,title,create_time,share_url,like_count,comment_count,view_count");

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max_count: 20 }),
      });
      if (!res.ok) {
        console.warn("[pulse] tiktok:", res.status, await res.text());
        return [];
      }
      const json = (await res.json()) as {
        data?: { videos?: TikTokVideo[] };
      };
      return (json.data?.videos ?? [])
        .filter((v) => new Date(v.create_time * 1000) >= since)
        .map((v) => ({
          platform: "tiktok" as const,
          externalId: v.id,
          authorHandle: openId,
          content: v.title ?? "",
          permalink: v.share_url,
          metrics: {
            likes: v.like_count ?? 0,
            comments: v.comment_count ?? 0,
            views: v.view_count ?? 0,
          },
          publishedAt: new Date(v.create_time * 1000),
        }));
    } catch (e) {
      console.warn("[pulse] tiktok ingest:", e instanceof Error ? e.message : e);
      return [];
    }
  }
}
