import type { MemberPlan } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db.server";
import { syncUnlockedDeliverables } from "@/lib/member-progress.server";
import { COMMISSION_RATES, PLAN_PRICES_CENTS } from "@/lib/tracks-data";

export function generateReferralCode(name: string): string {
  const base = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export async function recordReferralEarnings(
  newMemberId: string,
  plan: MemberPlan,
): Promise<void> {
  const prisma = getPrisma();
  const newMember = await prisma.member.findUnique({
    where: { id: newMemberId },
    select: { id: true, referredById: true },
  });
  if (!newMember?.referredById) return;

  const priceCents = PLAN_PRICES_CENTS[plan] ?? 0;
  if (priceCents === 0) return;

  let currentId: string | null = newMember.referredById;
  for (const { level, rate } of COMMISSION_RATES) {
    if (!currentId) break;
    const upline = await prisma.member.findUnique({
      where: { id: currentId },
      select: { id: true, referredById: true },
    });
    if (!upline) break;

    await prisma.referralEarning.create({
      data: {
        earnerId: upline.id,
        sourceId: newMemberId,
        level,
        amountCents: Math.round(priceCents * rate),
        plan,
        status: "pending",
      },
    });

    currentId = upline.referredById;
  }
}

export async function unlockMemberDeliverables(
  memberId: string,
  trackSlug: string,
  programDay = 0,
): Promise<void> {
  const maxUnlockDay = Math.min(programDay + 1, 7);
  await syncUnlockedDeliverables(memberId, trackSlug, maxUnlockDay);
}
