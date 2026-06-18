import { getPrisma } from "@/lib/db.server";
import { isChecklistComplete } from "@/lib/deliverable-utils";
import { getProgramDay } from "@/lib/member-progress.server";
import { PROOF_REFLECTION_MIN_CHARS, PROOF_REFLECTION_SLUGS } from "@/lib/proof-data";

export async function validateDeliverableCompletion(
  memberId: string,
  slug: string,
  reflectionNote?: string,
): Promise<void> {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("Member not found");

  const deliverable = await prisma.deliverable.findUnique({ where: { slug } });
  if (!deliverable) throw new Error("Deliverable not found");

  const maxUnlockDay = Math.min(getProgramDay(member) + 1, 7);
  if (deliverable.dayNumber > maxUnlockDay) {
    throw new Error("Deliverable is still locked");
  }

  const memberDeliverable = await prisma.memberDeliverable.findUnique({
    where: {
      memberId_deliverableId: { memberId, deliverableId: deliverable.id },
    },
  });
  if (!memberDeliverable) throw new Error("Deliverable not unlocked");

  const checked = memberDeliverable.checklistJson
    ? (JSON.parse(memberDeliverable.checklistJson) as number[])
    : [];
  if (!isChecklistComplete(deliverable.content, checked)) {
    throw new Error("Complete all checklist items first");
  }

  if (
    (PROOF_REFLECTION_SLUGS as readonly string[]).includes(slug) &&
    (!reflectionNote || reflectionNote.trim().length < PROOF_REFLECTION_MIN_CHARS)
  ) {
    throw new Error(`Reflection must be at least ${PROOF_REFLECTION_MIN_CHARS} characters`);
  }
}
