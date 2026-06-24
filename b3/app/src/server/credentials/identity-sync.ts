import { resolveCultureName } from "@/server/identity/resolve";
import { upsertCultureIdentityFromResolved } from "@/server/credentials/identity";
import { creditCultureIdMint } from "@/server/points/culture-id-mint-credit";
import { getPrisma } from "@/server/db/prisma";

export type SyncCultureIdentityResult =
  | {
      ok: true;
      handle: string;
      identityId: string;
      pointsGranted?: number;
      pointsAlreadyCredited?: boolean;
      referralMintPoints?: number;
      referralCodesIssued?: number;
    }
  | { ok: false; error: string };

export async function syncCultureIdentityFromHandle(input: {
  handle: string;
  evmAddress: string;
  referralCode?: string;
}): Promise<SyncCultureIdentityResult> {
  const handle = input.handle.trim().toLowerCase();
  if (!handle) return { ok: false, error: "handle_required" };

  const resolved = await resolveCultureName(handle);
  if (resolved.status !== "claimed" || !resolved.owner) {
    return { ok: false, error: "culture_name_not_claimed" };
  }

  if (resolved.owner.toLowerCase() !== input.evmAddress.toLowerCase()) {
    return { ok: false, error: "not_culture_id_owner" };
  }

  const identityId = await upsertCultureIdentityFromResolved(resolved, null);
  if (!identityId) return { ok: false, error: "identity_sync_failed" };

  let pointsGranted = 0;
  let pointsAlreadyCredited = false;
  let referralMintPoints = 0;
  let referralCodesIssued = 0;
  const prisma = getPrisma();
  if (prisma) {
    const wallet = input.evmAddress.toLowerCase();
    const existingRedemption = await prisma.identityReferralRedemption.findUnique({
      where: { wallet },
    });

    if (input.referralCode) {
      const { consumeReferralOnSync } = await import("@/server/identity/referral-codes");
      const consume = await consumeReferralOnSync(prisma, {
        wallet,
        code: input.referralCode,
        mintHandle: resolved.fullName.toLowerCase(),
        tokenId: resolved.tokenId ? Number(resolved.tokenId) : undefined,
      });
      if (!consume.ok && !existingRedemption) {
        return { ok: false, error: consume.error };
      }
      if (consume.ok) {
        referralMintPoints = consume.referralMintPoints ?? 0;
        referralCodesIssued = consume.codesIssued;
        pointsGranted += referralMintPoints;
      }
    } else if (!existingRedemption) {
      const { isIdentityTeamWallet } = await import("@/lib/identity/handle-policy");
      if (!isIdentityTeamWallet(wallet)) {
        return { ok: false, error: "referral_required" };
      }
    }

    if (resolved.tokenId) {
      const credit = await creditCultureIdMint(prisma, {
        evmAddress: input.evmAddress,
        handle: resolved.fullName.toLowerCase(),
        tokenId: Number(resolved.tokenId),
      });
      if (credit.ok) {
        pointsGranted += credit.pointsGranted;
        pointsAlreadyCredited = credit.alreadyCredited;
      }
    }
  }

  return {
    ok: true,
    handle: resolved.fullName.toLowerCase(),
    identityId,
    pointsGranted,
    pointsAlreadyCredited,
    referralMintPoints: referralMintPoints || undefined,
    referralCodesIssued: referralCodesIssued || undefined,
  };
}
