import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

import { extractTweetIdFromUrl } from "@/lib/twitter-intents";
import { scoreShareWithAgent } from "@/server/social/agent-share-score";
import {
  computeCultureValue,
  type CultureValueBreakdown,
  type ShareActionType,
} from "@/server/social/culture-value";
import {
  analyzeFarcasterShareCast,
  resolveFarcasterFidForAddress,
} from "@/server/neynar/farcaster-social-verify";
import { analyzeXShareTweet, fetchXShareTweetFields } from "@/server/x/verify-proof";
import { getTwitterUserClient } from "@/server/x/twitter-client";

export type SocialSharePlatform = "farcaster" | "x";

export type SocialShareVerifySuccess = {
  ok: true;
  cultureValue: number;
  breakdown: CultureValueBreakdown;
  actionType: ShareActionType;
  proofUrl: string;
  agentScored: boolean;
  text: string;
};

export type SocialShareVerifyFailure = {
  ok: false;
  code: string;
};

function getNeynarClient(): NeynarAPIClient | null {
  const key = process.env.NEYNAR_API_KEY?.trim();
  if (!key) return null;
  return new NeynarAPIClient(new Configuration({ apiKey: key }));
}

function normalizeProofUrl(url: string): string {
  return url.trim().split("?")[0] ?? url.trim();
}

async function verifyFarcasterShareStory(
  proofUrl: string,
  walletAddress: `0x${string}`,
): Promise<SocialShareVerifySuccess | SocialShareVerifyFailure> {
  const client = getNeynarClient();
  if (!client) return { ok: false, code: "neynar_not_configured" };

  const fid = await resolveFarcasterFidForAddress(client, walletAddress);
  if (fid == null) return { ok: false, code: "no_farcaster_for_wallet" };

  try {
    const res = await client.lookupCastByHashOrUrl({
      identifier: proofUrl.trim(),
      type: /^https?:\/\//i.test(proofUrl.trim()) ? "url" : "hash",
    });
    const cast = res.cast;
    if (!cast?.hash) return { ok: false, code: "cast_not_found" };
    if (cast.author.fid !== fid) return { ok: false, code: "cast_not_yours" };

    const analysis = analyzeFarcasterShareCast(cast);
    const agent = await scoreShareWithAgent(analysis.actionType, analysis.text, "farcaster");
    const { cultureValue, breakdown } = computeCultureValue(
      { ...analysis, agentBonus: agent.agentBonus },
      "farcaster",
    );

    const canonical =
      proofUrl.includes("warpcast.com") || proofUrl.includes("farcaster.xyz")
        ? normalizeProofUrl(proofUrl)
        : `https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`;

    return {
      ok: true,
      cultureValue,
      breakdown,
      actionType: analysis.actionType,
      proofUrl: canonical,
      agentScored: agent.agentScored,
      text: analysis.text,
    };
  } catch {
    return { ok: false, code: "cast_lookup_failed" };
  }
}

async function verifyXShareStory(
  proofUrl: string,
): Promise<SocialShareVerifySuccess | SocialShareVerifyFailure> {
  if (!extractTweetIdFromUrl(proofUrl)) {
    return { ok: false, code: "invalid_proof_url" };
  }

  const client = getTwitterUserClient();
  if (!client) return { ok: false, code: "x_api_unconfigured" };

  const fetched = await fetchXShareTweetFields(client, proofUrl);
  if (!fetched.ok) return { ok: false, code: fetched.error };

  const analysis = analyzeXShareTweet(fetched.data);
  const agent = await scoreShareWithAgent(analysis.actionType, analysis.text, "x");
  const { cultureValue, breakdown } = computeCultureValue(
    { ...analysis, agentBonus: agent.agentBonus },
    "x",
  );

  const proofId = extractTweetIdFromUrl(proofUrl)!;
  return {
    ok: true,
    cultureValue,
    breakdown,
    actionType: analysis.actionType,
    proofUrl: normalizeProofUrl(proofUrl) || `https://x.com/i/status/${proofId}`,
    agentScored: agent.agentScored,
    text: analysis.text,
  };
}

export async function verifySocialShareStory(input: {
  platform: SocialSharePlatform;
  proofUrl: string;
  walletAddress: `0x${string}`;
}): Promise<SocialShareVerifySuccess | SocialShareVerifyFailure> {
  const proofUrl = input.proofUrl.trim();
  if (!proofUrl) return { ok: false, code: "proof_url_required" };

  if (input.platform === "farcaster") {
    return verifyFarcasterShareStory(proofUrl, input.walletAddress);
  }
  return verifyXShareStory(proofUrl);
}

export function socialShareErrorMessage(code: string): string {
  switch (code) {
    case "neynar_not_configured":
      return "Server is missing NEYNAR_API_KEY.";
    case "no_farcaster_for_wallet":
      return "No Farcaster profile linked to this wallet. Verify your wallet on Warpcast first.";
    case "cast_not_found":
      return "Could not find that cast — check the Warpcast URL.";
    case "cast_not_yours":
      return "That cast is not from your linked Farcaster account.";
    case "x_api_unconfigured":
      return "X verification is not configured on the server.";
    case "invalid_proof_url":
      return "Paste a valid x.com/…/status/… link.";
    case "x_proof_tweet_not_found":
      return "Tweet not found — make sure it is public.";
    case "x_verify_failed":
      return "Could not verify that tweet yet. Wait a minute and try again.";
    case "already_claimed_today":
      return "You already earned Culture Value for sharing today. Come back tomorrow!";
    case "proof_already_used":
      return "This post was already claimed by another wallet.";
    default:
      return code;
  }
}
