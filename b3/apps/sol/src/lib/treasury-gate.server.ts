import { getPrisma } from "@/lib/db.server";

export async function requireAnchoredProof(memberId: string, periodKey: string): Promise<void> {
  const prisma = getPrisma();
  const anchored = await prisma.proofSnapshot.findFirst({
    where: {
      memberId,
      periodKey,
      status: "anchored",
      anchor: { isNot: null },
    },
    include: { anchor: true },
  });

  if (!anchored?.anchor) {
    throw new Error("Anchor verified proof for this period before claiming payouts.");
  }
}
