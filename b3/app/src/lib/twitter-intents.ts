/** Extract numeric tweet ID from x.com / twitter.com status URLs. */
export function extractTweetIdFromUrl(raw: string): string | null {
  const t = raw.trim();
  const m = t.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  return m?.[1] ?? null;
}

export function buildXIntentUrls(tweetId: string | null): {
  openPost: string | null;
  retweet: string | null;
  reply: string | null;
} {
  if (!tweetId) return { openPost: null, retweet: null, reply: null };
  return {
    openPost: `https://x.com/i/status/${tweetId}`,
    retweet: `https://twitter.com/intent/retweet?tweet_id=${tweetId}`,
    reply: `https://twitter.com/intent/tweet?in_reply_to=${tweetId}&text=${encodeURIComponent("#BuildCulture ")}`,
  };
}

export function isPlausibleTwitterStatusUrl(url: string): boolean {
  const t = url.trim();
  if (!/^https?:\/\//i.test(t)) return false;
  try {
    const u = new URL(t);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "twitter.com" && host !== "x.com") return false;
    return /\/status\/\d+/.test(u.pathname);
  } catch {
    return false;
  }
}
