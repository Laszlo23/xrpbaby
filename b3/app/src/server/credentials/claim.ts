import { randomUUID } from "node:crypto";

import type { CredentialSlug } from "@/lib/credentials/credential-catalog";
import {
  buildEligibilityContext,
  evaluateCredentialEligibility,
  type EligibilityContext,
} from "@/server/credentials/eligibility";
import { findCultureIdentityByHandle, upsertCultureIdentityFromResolved } from "@/server/credentials/identity";
import { recordReputationEvent } from "@/server/reputation/events";
import { getPrisma } from "@/server/db/prisma";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import type { Web3BioCredentials } from "@/lib/identity/identity-graph-types";

export type ClaimResult =
  | { ok: true; slug: string; userCredentialId: string; alreadyHeld: boolean }
  | { ok: false; error: string };

export async function claimCredential(input: {
  slug: CredentialSlug;
  handle?: string;
  memberId?: string | null;
  walletAddress?: string | null;
  resolved?: ResolvedCultureName | null;
  web3bioCredentials?: Web3BioCredentials | null;
  socialFollowers?: number;
}): Promise<ClaimResult> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "database_unavailable" };

  const credential = await prisma.credential.findUnique({ where: { slug: input.slug } });
  if (!credential) return { ok: false, error: "unknown_credential" };

  let identityId: string | null = null;
  if (input.resolved?.status === "claimed") {
    if (
      input.walletAddress &&
      input.resolved.owner &&
      input.resolved.owner.toLowerCase() !== input.walletAddress.toLowerCase()
    ) {
      return { ok: false, error: "not_culture_id_owner" };
    }
    identityId = await upsertCultureIdentityFromResolved(input.resolved, input.memberId);
  } else if (input.handle) {
    const existing = await findCultureIdentityByHandle(input.handle);
    identityId = existing?.id ?? null;
  }

  if (!identityId && input.walletAddress) {
    const byOwner = await prisma.cultureIdentity.findFirst({
      where: { ownerAddress: input.walletAddress.toLowerCase() },
    });
    identityId = byOwner?.id ?? null;
  }

  if (!identityId) {
    return { ok: false, error: "culture_identity_required" };
  }

  const existingGrant = await prisma.userCredential.findUnique({
    where: { credentialId_identityId: { credentialId: credential.id, identityId } },
  });
  if (existingGrant?.status === "active") {
    return {
      ok: true,
      slug: input.slug,
      userCredentialId: existingGrant.id,
      alreadyHeld: true,
    };
  }

  const identity = await prisma.cultureIdentity.findUnique({
    where: { id: identityId },
    include: { userCredentials: { include: { credential: true }, where: { status: "active" } } },
  });
  if (!identity) return { ok: false, error: "identity_not_found" };

  const earnedSlugs = new Set(
    identity.userCredentials.map((uc) => uc.credential.slug),
  );

  const ctx: EligibilityContext = await buildEligibilityContext({
    memberId: input.memberId ?? identity.memberId,
    walletAddress: input.walletAddress ?? identity.ownerAddress,
    web3bioCredentials: input.web3bioCredentials,
    socialFollowers: input.socialFollowers,
  });

  const eligibility = await evaluateCredentialEligibility(ctx, earnedSlugs);
  const match = eligibility.find((e) => e.slug === input.slug);
  if (!match?.eligible) {
    return { ok: false, error: match?.reason ?? "not_eligible" };
  }

  const userCredential = await prisma.userCredential.upsert({
    where: { credentialId_identityId: { credentialId: credential.id, identityId } },
    create: {
      id: randomUUID(),
      credentialId: credential.id,
      identityId,
      memberId: input.memberId ?? identity.memberId,
      status: "active",
      evidence: { reason: match.reason, claimedAt: new Date().toISOString() },
    },
    update: {
      status: "active",
      revokedAt: null,
      evidence: { reason: match.reason, claimedAt: new Date().toISOString() },
    },
  });

  await recordReputationEvent({
    identityId,
    type: "credential_issued",
    weight: 1.5,
    source: "platform",
    proofRef: userCredential.id,
    metadata: { slug: input.slug },
  });

  return {
    ok: true,
    slug: input.slug,
    userCredentialId: userCredential.id,
    alreadyHeld: false,
  };
}

export async function getMemberCredentialState(input: {
  handle?: string;
  walletAddress?: string | null;
  web3bioCredentials?: Web3BioCredentials | null;
  socialFollowers?: number;
  memberId?: string | null;
}) {
  try {
    const prisma = getPrisma();

    let identity = input.handle ? await findCultureIdentityByHandle(input.handle) : null;
    if (!identity && input.walletAddress) {
      identity =
        (await prisma?.cultureIdentity.findFirst({
          where: { ownerAddress: input.walletAddress.toLowerCase() },
          include: {
            linkedWallets: true,
            userCredentials: { include: { credential: true }, where: { status: "active" } },
            reputationEvents: { orderBy: { createdAt: "desc" }, take: 20 },
          },
        })) ?? null;
    }

    const earnedSlugs = new Set(identity?.userCredentials.map((uc) => uc.credential.slug) ?? []);

    const ctx = await buildEligibilityContext({
      memberId: input.memberId ?? identity?.memberId,
      walletAddress: input.walletAddress ?? identity?.ownerAddress,
      web3bioCredentials: input.web3bioCredentials,
      socialFollowers: input.socialFollowers,
    });

    const eligibility = await evaluateCredentialEligibility(ctx, earnedSlugs);
    const humans = ctx.web3bioCredentials?.isHuman ?? [];

    return {
      identity,
      eligibility,
      earned: identity?.userCredentials ?? [],
      linkedWallets: identity?.linkedWallets ?? [],
      hasCultureIdentity: Boolean(identity),
      pointsTotal: ctx.pointsTotal ?? 0,
      questCount: ctx.questCount ?? 0,
      studioProjectCount: ctx.studioProjectCount ?? 0,
      referralCount: ctx.referralCount ?? 0,
      hasHumanAttestation: humans.length > 0,
    };
  } catch (error) {
    console.warn("getMemberCredentialState: database query failed", error);
    const ctx = await buildEligibilityContext({
      memberId: input.memberId,
      walletAddress: input.walletAddress,
      web3bioCredentials: input.web3bioCredentials,
      socialFollowers: input.socialFollowers,
    }).catch(() => ({
      pointsTotal: 0,
      questCount: 0,
      studioProjectCount: 0,
      referralCount: 0,
      web3bioCredentials: input.web3bioCredentials,
    }));
    const eligibility = await evaluateCredentialEligibility(ctx, new Set()).catch(() => []);
    return {
      identity: null,
      eligibility,
      earned: [],
      linkedWallets: [],
      hasCultureIdentity: false,
      pointsTotal: ctx.pointsTotal ?? 0,
      questCount: ctx.questCount ?? 0,
      studioProjectCount: ctx.studioProjectCount ?? 0,
      referralCount: ctx.referralCount ?? 0,
      hasHumanAttestation: (ctx.web3bioCredentials?.isHuman.length ?? 0) > 0,
    };
  }
}
