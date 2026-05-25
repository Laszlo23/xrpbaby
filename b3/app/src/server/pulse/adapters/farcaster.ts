import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

import type { IngestItem, PulseIngestAdapter } from "../types";

function client(): NeynarAPIClient | null {
  const key = process.env.NEYNAR_API_KEY?.trim();
  if (!key) return null;
  return new NeynarAPIClient(new Configuration({ apiKey: key }));
}

type NeynarCast = {
  hash: string;
  author: { username?: string; display_name?: string | null };
  text?: string;
  timestamp: string;
  reactions?: { likes_count?: number; recasts_count?: number };
  replies?: { count?: number };
};

export class FarcasterPulseAdapter implements PulseIngestAdapter {
  readonly platform = "farcaster" as const;

  isEnabled(): boolean {
    return client() !== null;
  }

  async ingest(since: Date): Promise<IngestItem[]> {
    const c = client();
    if (!c) return [];

    const query =
      process.env.PULSE_FARCASTER_SEARCH?.trim() ?? "building culture";

    try {
      const search = await c.searchCasts({ q: query, limit: 25 });
      const casts = (search as { casts?: NeynarCast[] }).casts ?? [];
      return casts
        .filter((cast) => new Date(cast.timestamp) >= since)
        .map((cast) => this.mapCast(cast));
    } catch (e) {
      console.warn("[pulse] farcaster ingest:", e instanceof Error ? e.message : e);
      return [];
    }
  }

  private mapCast(cast: NeynarCast): IngestItem {
    const username = cast.author.username ?? "unknown";
    return {
      platform: "farcaster",
      externalId: cast.hash,
      authorHandle: username,
      authorName: cast.author.display_name ?? undefined,
      content: cast.text ?? "",
      permalink: `https://warpcast.com/${username}/${cast.hash.slice(0, 10)}`,
      metrics: {
        likes: cast.reactions?.likes_count ?? 0,
        recasts: cast.reactions?.recasts_count ?? 0,
        replies: cast.replies?.count ?? 0,
      },
      publishedAt: new Date(cast.timestamp),
    };
  }
}
