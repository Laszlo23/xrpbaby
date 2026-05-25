import type { TwitterApi } from "twitter-api-v2";

export type PostMarketingTweetResult =
  | { ok: true; tweetId: string; url: string }
  | { ok: false; error: string };

export async function postMarketingTweet(
  client: TwitterApi,
  text: string,
  replyToTweetId?: string,
): Promise<PostMarketingTweetResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty_text" };
  if (trimmed.length > 280) return { ok: false, error: "text_too_long" };

  try {
    const reply = replyToTweetId?.trim()
      ? { in_reply_to_tweet_id: replyToTweetId.trim() }
      : undefined;
    const res = await client.v2.tweet(reply ? { text: trimmed, reply } : { text: trimmed });
    const tweetId = res.data.id;
    if (!tweetId) return { ok: false, error: "no_tweet_id" };
    return { ok: true, tweetId, url: `https://x.com/i/status/${tweetId}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "tweet_post_failed";
    return { ok: false, error: msg };
  }
}
