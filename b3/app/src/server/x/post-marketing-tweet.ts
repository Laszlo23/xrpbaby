import type { TwitterApi } from "twitter-api-v2";

import { resolveSocialMediaPath } from "@/server/x/resolve-social-media";

export type PostMarketingTweetResult =
  | { ok: true; tweetId: string; url: string }
  | { ok: false; error: string };

export type PostMarketingTweetOptions = {
  replyToTweetId?: string;
  imagePath?: string;
};

export async function postMarketingTweet(
  client: TwitterApi,
  text: string,
  replyToTweetIdOrOptions?: string | PostMarketingTweetOptions,
  legacyImagePath?: string,
): Promise<PostMarketingTweetResult> {
  const opts: PostMarketingTweetOptions =
    typeof replyToTweetIdOrOptions === "string"
      ? { replyToTweetId: replyToTweetIdOrOptions, imagePath: legacyImagePath }
      : (replyToTweetIdOrOptions ?? {});

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty_text" };
  if (trimmed.length > 280) return { ok: false, error: "text_too_long" };

  let mediaIds: [string] | undefined;
  if (opts.imagePath) {
    const resolved = resolveSocialMediaPath(opts.imagePath);
    if (!resolved.ok) return { ok: false, error: resolved.error };
    try {
      const mediaId = await client.v1.uploadMedia(resolved.absPath);
      mediaIds = [mediaId];
    } catch (e) {
      const msg = e instanceof Error ? e.message : "media_upload_failed";
      return { ok: false, error: msg };
    }
  }

  try {
    const reply = opts.replyToTweetId?.trim()
      ? { in_reply_to_tweet_id: opts.replyToTweetId.trim() }
      : undefined;
    const payload = mediaIds
      ? { text: trimmed, media: { media_ids: mediaIds }, ...(reply ? { reply } : {}) }
      : reply
        ? { text: trimmed, reply }
        : { text: trimmed };
    const res = await client.v2.tweet(payload);
    const tweetId = res.data.id;
    if (!tweetId) return { ok: false, error: "no_tweet_id" };
    return { ok: true, tweetId, url: `https://x.com/i/status/${tweetId}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "tweet_post_failed";
    return { ok: false, error: msg };
  }
}
