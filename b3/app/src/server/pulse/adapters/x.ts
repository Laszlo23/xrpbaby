import { getTwitterUserClient } from "@/server/x/twitter-client";

import type { IngestItem, PulseIngestAdapter } from "../types";

export class XPulseAdapter implements PulseIngestAdapter {
  readonly platform = "x" as const;

  isEnabled(): boolean {
    return getTwitterUserClient() !== null;
  }

  async ingest(since: Date): Promise<IngestItem[]> {
    const client = getTwitterUserClient();
    if (!client) return [];

    const userId = process.env.PULSE_X_USER_ID?.trim();
    try {
      let uid = userId;
      if (!uid) {
        const handle = process.env.PULSE_X_HANDLE?.trim()?.replace(/^@/, "") ?? "buildingculture";
        const u = await client.v2.userByUsername(handle);
        uid = u.data?.id;
      }
      if (!uid) return [];

      const timeline = await client.v2.userTimeline(uid, {
        max_results: 25,
        exclude: ["retweets", "replies"],
        "tweet.fields": ["created_at", "public_metrics", "text"],
      });

      const items: IngestItem[] = [];
      for (const tweet of timeline.tweets ?? []) {
        if (!tweet.created_at) continue;
        const at = new Date(tweet.created_at);
        if (at < since) continue;
        items.push({
          platform: "x",
          externalId: tweet.id,
          authorHandle: process.env.PULSE_X_HANDLE?.trim() ?? "buildingculture",
          content: tweet.text ?? "",
          permalink: `https://x.com/i/web/status/${tweet.id}`,
          metrics: {
            likes: tweet.public_metrics?.like_count ?? 0,
            replies: tweet.public_metrics?.reply_count ?? 0,
            reposts: tweet.public_metrics?.retweet_count ?? 0,
          },
          publishedAt: at,
        });
      }
      return items;
    } catch (e) {
      console.warn("[pulse] x ingest:", e instanceof Error ? e.message : e);
      return [];
    }
  }
}
