import type { Address } from "viem";
import { isAddress } from "viem";

const REF_STORAGE_KEY = "buildchain_campaign_ref";

/** Persist valid referral address from URL for later mints. */
export function persistReferrerFromSearch(ref: string | undefined) {
  if (!ref || !isAddress(ref)) return;
  try {
    sessionStorage.setItem(REF_STORAGE_KEY, ref.toLowerCase());
  } catch {
    /* ignore */
  }
}

export function getStoredReferrer(): Address | undefined {
  try {
    const v = sessionStorage.getItem(REF_STORAGE_KEY);
    if (v && isAddress(v)) return v as Address;
  } catch {
    /* ignore */
  }
  return undefined;
}

export function clearStoredReferrer() {
  try {
    sessionStorage.removeItem(REF_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildCampaignUrl(origin: string, ref?: Address): string {
  const u = new URL(`${origin.replace(/\/$/, "")}/campaign`);
  if (ref) u.searchParams.set("ref", ref);
  return u.toString();
}

/** Warpcast / Farcaster compose (share as cast intent). */
export function warpcastComposeUrl(text: string): string {
  const u = new URL("https://warpcast.com/~/compose");
  u.searchParams.set("text", text);
  return u.href;
}

/** X / Twitter Web Intent */
export function twitterIntentUrl(text: string, url?: string): string {
  const u = new URL("https://twitter.com/intent/tweet");
  u.searchParams.set("text", text);
  if (url) u.searchParams.set("url", url);
  return u.href;
}

export async function shareNative(payload: { title: string; text: string; url: string }) {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
    return true;
  } catch {
    return false;
  }
}
