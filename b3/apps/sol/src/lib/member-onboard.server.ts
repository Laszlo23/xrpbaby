import type { MemberPlan } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db.server";
import { allocateCommunityStake } from "@/lib/community-stake.server";
import {
  generateReferralCode,
  recordReferralEarnings,
  unlockMemberDeliverables,
} from "@/lib/referral.server";
import { setSessionToken } from "@/lib/session.server";
import { getTrack } from "@/lib/tracks-data";

export type SignupInput = {
  email: string;
  name: string;
  trackSlug: string;
  plan: MemberPlan;
  referralCode?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export async function createMemberFromSignup(data: SignupInput) {
  const prisma = getPrisma();
  const track = getTrack(data.trackSlug);
  if (!track) throw new Error("Invalid track");

  const existing = await prisma.member.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new Error("Email already registered. Use login instead.");

  let referredById: string | undefined;
  if (data.referralCode) {
    const upline = await prisma.member.findUnique({
      where: { referralCode: data.referralCode.toUpperCase() },
    });
    if (upline) referredById = upline.id;
  }

  let referralCode = generateReferralCode(data.name);
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.member.findUnique({ where: { referralCode } });
    if (!clash) break;
    referralCode = generateReferralCode(data.name);
  }

  const member = await prisma.member.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      trackSlug: data.trackSlug,
      plan: data.plan,
      referralCode,
      referredById,
      programStartDate: new Date(),
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
    },
  });

  await unlockMemberDeliverables(member.id, data.trackSlug, 0);
  await recordReferralEarnings(member.id, data.plan);
  if (data.plan === "MONTHLY" || data.plan === "LIFETIME") {
    await allocateCommunityStake(member.id, data.plan);
  }

  return { member, trackTitle: track.title };
}

export async function createMemberSession(memberId: string) {
  const prisma = getPrisma();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.memberSession.create({
    data: { memberId, token, expiresAt },
  });

  setSessionToken(token);
  return token;
}
