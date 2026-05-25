import { TwitterApi } from "twitter-api-v2";

import type { AgentTaskWorkflowResult, ExecuteAgentTaskActivityInput } from "../agent-task-types.js";

function getTwitterUserClient(): TwitterApi | null {
  const appKey = process.env.X_CONSUMER_KEY?.trim();
  const appSecret = process.env.X_CONSUMER_SECRET?.trim();
  const accessToken = process.env.X_ACCESS_TOKEN?.trim();
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET?.trim();
  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;
  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });
}

async function postMarketingTweet(
  client: TwitterApi,
  text: string,
  replyToTweetId?: string,
): Promise<{ ok: true; tweetId: string; url: string } | { ok: false; error: string }> {
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

export async function executeAgentTask(
  input: ExecuteAgentTaskActivityInput,
): Promise<AgentTaskWorkflowResult> {
  const text = input.marketingText?.trim();
  if (input.taskKey === "social_burst" && text) {
    const client = getTwitterUserClient();
    if (!client) {
      return {
        agentId: input.agentId,
        agentSlug: input.agentSlug,
        mode: "skipped",
        detail: "x_oauth_unconfigured",
      };
    }
    const result = await postMarketingTweet(client, text, input.replyToTweetId?.trim());
    if (!result.ok) {
      throw new Error(result.error);
    }
    return {
      agentId: input.agentId,
      agentSlug: input.agentSlug,
      mode: "tweet",
      detail: result.tweetId,
      tweetUrl: result.url,
    };
  }

  return {
    agentId: input.agentId,
    agentSlug: input.agentSlug,
    mode: "noop",
    detail: input.agentSlug,
  };
}
