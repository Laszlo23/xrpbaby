import { extractTweetIdFromUrl } from "@/lib/twitter-intents";
import type { TwitterApi } from "twitter-api-v2";

export type XProofTaskSlug = "x-reply-official" | "x-retweet-official" | "x-quote-official";

/** Target post for X quests: explicit id, else parsed from VITE_X_TARGET_POST_URL (SSR/build env). */
export function resolveOfficialQuestTargetTweetId(): string | null {
  const direct = process.env.X_OFFICIAL_QUEST_TARGET_TWEET_ID?.trim();
  if (direct && /^\d+$/.test(direct)) return direct;
  const url = process.env.VITE_X_TARGET_POST_URL?.trim();
  if (url) {
    const fromUrl = extractTweetIdFromUrl(url);
    if (fromUrl) return fromUrl;
  }
  return null;
}

export function tweetSatisfiesXProofTask(
  taskSlug: XProofTaskSlug,
  targetTweetId: string,
  referencedTweets: { id: string; type: string }[] | undefined,
): boolean {
  const target = targetTweetId.trim();
  const refs = referencedTweets ?? [];
  switch (taskSlug) {
    case "x-retweet-official":
      return refs.some((r) => r.type === "retweeted" && r.id === target);
    case "x-quote-official":
      return refs.some((r) => r.type === "quoted" && r.id === target);
    case "x-reply-official":
      return refs.some((r) => r.type === "replied_to" && r.id === target);
    default:
      return false;
  }
}

export type VerifyXProofResult =
  | { ok: true }
  | { ok: false; error: "x_api_unconfigured" | "x_verify_failed" | "x_proof_tweet_not_found" };

export async function verifyXProofTweet(
  client: TwitterApi,
  proofUrl: string,
  taskSlug: XProofTaskSlug,
  targetTweetId: string,
): Promise<VerifyXProofResult> {
  const proofId = extractTweetIdFromUrl(proofUrl);
  if (!proofId) return { ok: false, error: "x_verify_failed" };

  try {
    const res = await client.v2.singleTweet(proofId, {
      "tweet.fields": ["referenced_tweets"],
    });
    const data = res.data as { referenced_tweets?: { id: string; type: string }[] } | undefined;
    if (!data) return { ok: false, error: "x_proof_tweet_not_found" };

    const ok = tweetSatisfiesXProofTask(taskSlug, targetTweetId, data.referenced_tweets);
    return ok ? { ok: true } : { ok: false, error: "x_verify_failed" };
  } catch {
    return { ok: false, error: "x_verify_failed" };
  }
}
