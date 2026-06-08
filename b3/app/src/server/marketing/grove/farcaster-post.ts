import { groveFarcasterChannelId, groveNeynarSignerUuid } from "./env";

const NEYNAR_CAST_URL = "https://api.neynar.com/v2/farcaster/cast";

export type PostFarcasterCastResult =
  | { ok: true; hash: string; url: string }
  | { ok: false; error: string };

export function groveFarcasterConfigured(): boolean {
  const key = process.env.NEYNAR_API_KEY?.trim();
  const signer = groveNeynarSignerUuid();
  return Boolean(key && signer);
}

export async function postGroveFarcasterCast(text: string): Promise<PostFarcasterCastResult> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  const signerUuid = groveNeynarSignerUuid();
  if (!apiKey) return { ok: false, error: "neynar_not_configured" };
  if (!signerUuid) return { ok: false, error: "grove_signer_not_configured" };

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty_text" };
  if (trimmed.length > 1024) return { ok: false, error: "text_too_long" };

  const body: Record<string, string> = {
    signer_uuid: signerUuid,
    text: trimmed,
  };
  const channelId = groveFarcasterChannelId();
  if (channelId) body.channel_id = channelId;

  try {
    const res = await fetch(NEYNAR_CAST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    const raw = await res.text();
    let data: { cast?: { hash?: string }; hash?: string; message?: string } = {};
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      /* keep empty */
    }

    if (!res.ok) {
      const msg = data?.message || raw.slice(0, 200) || `http_${res.status}`;
      return { ok: false, error: msg };
    }

    const hash = data?.cast?.hash ?? data?.hash;
    if (!hash) return { ok: false, error: "no_cast_hash" };

    return {
      ok: true,
      hash,
      url: `https://warpcast.com/~/conversations/${hash}`,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "cast_failed" };
  }
}
