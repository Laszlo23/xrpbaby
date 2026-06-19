import { extractTweetIdFromUrl } from "@/lib/twitter-intents";
import { getServerPublicOrigin } from "@/lib/app-origin";
import type { ShareActionType } from "@/server/social/culture-value";
import { resolveXTagHandles, textMentionsAllHandles } from "@/server/social/share-tags";
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

export type XShareTweetFields = {
  text?: string;
  referenced_tweets?: { id: string; type: string }[];
  attachments?: { media_keys?: string[] };
  entities?: { urls?: { expanded_url?: string }[] };
};

export type XShareAnalysis = {
  actionType: ShareActionType;
  text: string;
  mentionsOk: boolean;
  hasAppLink: boolean;
  hasHashtag: boolean;
  hasMedia: boolean;
};

function xAppLinkNeedles(): string[] {
  const needles = new Set<string>();
  try {
    const origin = getServerPublicOrigin().replace(/\/$/, "").toLowerCase();
    needles.add(origin);
    needles.add(new URL(origin).hostname.toLowerCase());
  } catch {
    /* ignore */
  }
  return [...needles];
}

export function classifyXShareAction(
  refs: { id: string; type: string }[] | undefined,
): ShareActionType {
  const list = refs ?? [];
  if (list.some((r) => r.type === "retweeted")) return "repost";
  if (list.some((r) => r.type === "quoted")) return "quote";
  if (list.some((r) => r.type === "replied_to")) return "reply";
  return "original";
}

/** Classify an X tweet for share-story scoring. */
export function analyzeXShareTweet(data: XShareTweetFields): XShareAnalysis {
  const text = (data.text ?? "").trim();
  const actionType = classifyXShareAction(data.referenced_tweets);
  const xHandles = resolveXTagHandles();
  const mentionsOk = textMentionsAllHandles(text, xHandles);
  const needles = xAppLinkNeedles();
  const expanded = (data.entities?.urls ?? []).map((u) => u.expanded_url ?? "").join(" ");
  const haystack = `${text} ${expanded}`.toLowerCase();
  const hasAppLink = needles.some((n) => haystack.includes(n.toLowerCase()));
  const hasHashtag = text.toLowerCase().includes("#buildculture");
  const hasMedia = (data.attachments?.media_keys?.length ?? 0) > 0;

  return { actionType, text, mentionsOk, hasAppLink, hasHashtag, hasMedia };
}

export async function fetchXShareTweetFields(
  client: TwitterApi,
  proofUrl: string,
): Promise<
  | { ok: true; data: XShareTweetFields }
  | { ok: false; error: "x_verify_failed" | "x_proof_tweet_not_found" }
> {
  const proofId = extractTweetIdFromUrl(proofUrl);
  if (!proofId) return { ok: false, error: "x_verify_failed" };

  try {
    const res = await client.v2.singleTweet(proofId, {
      "tweet.fields": ["referenced_tweets", "attachments", "entities"],
    });
    const data = res.data as XShareTweetFields | undefined;
    if (!data) return { ok: false, error: "x_proof_tweet_not_found" };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "x_verify_failed" };
  }
}
