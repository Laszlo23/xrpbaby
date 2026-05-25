import type { Address } from "viem";
import { fetchWalletIdentities } from "@/lib/chain/walletIdentities";
import {
  fetchFarcasterCasts,
  fetchUserByFid,
  userCastMatchesHashtag,
  userFollowsFid,
} from "@/lib/social/neynar";
import { OFFICIAL_FARCASTER_FID, QUEST_HASHTAG, miniAppUrl } from "./site";
import type { TaskId } from "./tasks";

export type VerifyResult =
  | { ok: true; proof?: string }
  | { ok: false; error: string };

export async function verifyTask(
  fid: number,
  taskId: TaskId,
): Promise<VerifyResult> {
  switch (taskId) {
    case "link_wallet":
      return verifyLinkWallet(fid);
    case "follow_official":
      return verifyFollowOfficial(fid);
    case "cast_hashtag":
      return verifyCastHashtag(fid);
    case "mint_identity":
      return verifyMintIdentity(fid);
    case "share_mini":
      return verifyShareMini(fid);
    case "view_profile":
      return verifyViewProfile(fid);
    default:
      return { ok: false, error: "Unknown task" };
  }
}

async function verifyLinkWallet(fid: number): Promise<VerifyResult> {
  const user = await fetchUserByFid(fid);
  if (!user) return { ok: false, error: "Farcaster profile not found" };
  if (user.verifiedAddresses.length === 0) {
    return {
      ok: false,
      error: "Add a verified wallet in Warpcast settings first",
    };
  }
  return { ok: true, proof: user.verifiedAddresses[0] };
}

async function verifyFollowOfficial(fid: number): Promise<VerifyResult> {
  if (!OFFICIAL_FARCASTER_FID) {
    return { ok: false, error: "Official FID not configured on server" };
  }
  const follows = await userFollowsFid(fid, OFFICIAL_FARCASTER_FID);
  if (!follows) {
    return { ok: false, error: "Follow @buildingcultu3 on Warpcast, then verify" };
  }
  return { ok: true };
}

async function verifyCastHashtag(fid: number): Promise<VerifyResult> {
  const match = await userCastMatchesHashtag(fid, QUEST_HASHTAG);
  if (!match) {
    return {
      ok: false,
      error: `Post a cast with #${QUEST_HASHTAG}, then verify again`,
    };
  }
  return { ok: true, proof: match };
}

async function verifyMintIdentity(fid: number): Promise<VerifyResult> {
  const user = await fetchUserByFid(fid);
  if (!user) return { ok: false, error: "Farcaster profile not found" };

  for (const addr of user.verifiedAddresses) {
    const { identities } = await fetchWalletIdentities(addr as Address);
    if (identities.length > 0) {
      return { ok: true, proof: identities[0]!.fullName };
    }
  }

  return {
    ok: false,
    error: "Mint an identity with your verified wallet, then verify",
  };
}

async function verifyShareMini(fid: number): Promise<VerifyResult> {
  const url = miniAppUrl("/");
  const casts = await fetchFarcasterCasts(fid, 12);
  const match = casts.find(
    (c) =>
      c.text.toLowerCase().includes(url.replace("https://", "").toLowerCase()) ||
      c.text.includes("mini.buildingcultureid") ||
      c.text.includes("buildingcultureid"),
  );
  if (!match) {
    return {
      ok: false,
      error: "Share the mini app in a cast, then verify",
    };
  }
  return { ok: true, proof: match.hash };
}

async function verifyViewProfile(fid: number): Promise<VerifyResult> {
  const user = await fetchUserByFid(fid);
  if (!user) return { ok: false, error: "Farcaster profile not found" };

  for (const addr of user.verifiedAddresses) {
    const { identities } = await fetchWalletIdentities(addr as Address);
    if (identities.length > 0) {
      return { ok: true, proof: identities[0]!.fullName };
    }
  }

  return {
    ok: false,
    error: "Mint an identity first to unlock your profile",
  };
}
