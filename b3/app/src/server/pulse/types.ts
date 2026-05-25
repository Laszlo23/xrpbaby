export type PulsePlatform =
  | "farcaster"
  | "x"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "native";

export type IngestItem = {
  platform: PulsePlatform;
  externalId: string;
  authorHandle?: string;
  authorName?: string;
  content: string;
  mediaUrls?: string[];
  permalink?: string;
  metrics?: Record<string, number>;
  publishedAt: Date;
  featured?: boolean;
};

export interface PulseIngestAdapter {
  readonly platform: PulsePlatform;
  isEnabled(): boolean;
  ingest(since: Date): Promise<IngestItem[]>;
}
