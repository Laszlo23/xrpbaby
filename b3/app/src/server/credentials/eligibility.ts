import type { Web3BioCredentials } from "@/lib/identity/identity-graph-types";
import type { CredentialSlug } from "@/lib/credentials/credential-catalog";
import { getPrisma } from "@/server/db/prisma";

export type CredentialEligibility = {
  slug: CredentialSlug;
  eligible: boolean;
  earned: boolean;
  reason: string;
};

export type EligibilityContext = {
  memberId?: string | null;
  walletAddress?: string | null;
  forestStage?: string | null;
  supporterTier?: string | null;
  farcasterUsername?: string | null;
  pointsTotal?: number;
  questCount?: number;
  buildTaskCount?: number;
  referralCount?: number;
  studioProjectCount?: number;
  web3bioCredentials?: Web3BioCredentials | null;
  socialFollowers?: number;
};

async function countLedgers(walletId: string, filter?: (slug: string | null) => boolean): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;
  const rows = await prisma.pointLedger.findMany({
    where: { walletId },
    select: { taskSlug: true, delta: true },
  });
  if (!filter) {
    return rows.reduce((sum, r) => sum + (r.delta > 0 ? r.delta : 0), 0);
  }
  return rows.filter((r) => filter(r.taskSlug)).length;
}

export async function buildEligibilityContext(input: {
  memberId?: string | null;
  walletAddress?: string | null;
  web3bioCredentials?: Web3BioCredentials | null;
  socialFollowers?: number;
}): Promise<EligibilityContext> {
  const prisma = getPrisma();
  if (!prisma || !input.walletAddress) {
    return {
      memberId: input.memberId,
      walletAddress: input.walletAddress,
      web3bioCredentials: input.web3bioCredentials,
      socialFollowers: input.socialFollowers ?? 0,
      pointsTotal: 0,
      questCount: 0,
      buildTaskCount: 0,
      referralCount: 0,
      studioProjectCount: 0,
    };
  }

  try {
    const normalized = input.walletAddress.toLowerCase();
    const member =
      input.memberId != null
        ? await prisma.member.findUnique({ where: { id: input.memberId } })
        : await prisma.member.findFirst({ where: { walletAddress: normalized } });

    const wallet = await prisma.wallet.findUnique({ where: { address: normalized } });
    let pointsTotal = 0;
    let questCount = 0;
    let buildTaskCount = 0;
    let referralCount = 0;

    if (wallet) {
      const ledgers = await prisma.pointLedger.findMany({ where: { walletId: wallet.id } });
      pointsTotal = ledgers.reduce((sum, r) => sum + (r.delta > 0 ? r.delta : 0), 0);
      questCount = ledgers.filter((r) => r.taskSlug && r.delta > 0).length;
      buildTaskCount = ledgers.filter(
        (r) => r.taskSlug?.startsWith("build:") || r.taskSlug?.includes("studio"),
      ).length;
      referralCount = ledgers.filter((r) => r.taskSlug?.includes("referral")).length;
    }

    let studioProjectCount = 0;
    if (member) {
      studioProjectCount = await prisma.studioProject.count({
        where: { memberId: member.id, status: { in: ["live", "preview"] } },
      });
    }

    return {
      memberId: member?.id ?? input.memberId,
      walletAddress: normalized,
      forestStage: member?.forestStage,
      supporterTier: member?.supporterTier,
      farcasterUsername: member?.farcasterUsername,
      pointsTotal,
      questCount,
      buildTaskCount,
      referralCount,
      studioProjectCount,
      web3bioCredentials: input.web3bioCredentials,
      socialFollowers: input.socialFollowers ?? 0,
    };
  } catch (error) {
    console.warn("buildEligibilityContext: database query failed", error);
    return {
      memberId: input.memberId,
      walletAddress: input.walletAddress,
      web3bioCredentials: input.web3bioCredentials,
      socialFollowers: input.socialFollowers ?? 0,
      pointsTotal: 0,
      questCount: 0,
      buildTaskCount: 0,
      referralCount: 0,
      studioProjectCount: 0,
    };
  }
}

function evaluateSlug(slug: CredentialSlug, ctx: EligibilityContext): Omit<CredentialEligibility, "earned"> {
  switch (slug) {
    case "builder":
      if ((ctx.studioProjectCount ?? 0) >= 1) {
        return { slug, eligible: true, reason: "Published Studio project" };
      }
      if ((ctx.buildTaskCount ?? 0) >= 3) {
        return { slug, eligible: true, reason: "3+ build tasks completed" };
      }
      return { slug, eligible: false, reason: "Ship a Studio project or complete 3+ build tasks" };
    case "contributor":
      if ((ctx.pointsTotal ?? 0) >= 500) {
        return { slug, eligible: true, reason: "500+ Culture Points earned" };
      }
      if ((ctx.questCount ?? 0) >= 10) {
        return { slug, eligible: true, reason: "10+ quests completed" };
      }
      return { slug, eligible: false, reason: "Earn 500 Culture Points or complete 10 quests" };
    case "community-leader":
      if ((ctx.referralCount ?? 0) >= 5) {
        return { slug, eligible: true, reason: "5+ referral completions" };
      }
      if (ctx.supporterTier === "founding" || ctx.supporterTier === "elder") {
        return { slug, eligible: true, reason: `${ctx.supporterTier} supporter tier` };
      }
      if ((ctx.socialFollowers ?? 0) >= 1000) {
        return { slug, eligible: true, reason: "1k+ social followers" };
      }
      return { slug, eligible: false, reason: "5+ referrals, founding tier, or 1k+ followers" };
    case "verified-human": {
      const humans = ctx.web3bioCredentials?.isHuman ?? [];
      if (humans.length > 0) {
        return { slug, eligible: true, reason: humans[0]?.label ?? "Web3.bio human attestation" };
      }
      return { slug, eligible: false, reason: "Connect a verified human attestation (Coinbase KYC, Passport, etc.)" };
    }
    case "trusted-agent":
      return { slug, eligible: false, reason: "Trusted agents are issued by Building Culture after review" };
    case "verified-project":
      return { slug, eligible: false, reason: "Verified projects are issued after Grant Proof or BC review" };
    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}

export async function evaluateCredentialEligibility(
  ctx: EligibilityContext,
  earnedSlugs: Set<string>,
): Promise<CredentialEligibility[]> {
  const slugs: CredentialSlug[] = [
    "builder",
    "contributor",
    "community-leader",
    "verified-human",
    "trusted-agent",
    "verified-project",
  ];

  return slugs.map((slug) => {
    const base = evaluateSlug(slug, ctx);
    return { ...base, earned: earnedSlugs.has(slug) };
  });
}

export async function loadMemberPointsTotal(walletAddress: string): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;
  const wallet = await prisma.wallet.findUnique({ where: { address: walletAddress.toLowerCase() } });
  if (!wallet) return 0;
  return countLedgers(wallet.id);
}
