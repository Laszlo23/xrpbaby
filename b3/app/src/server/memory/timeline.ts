import { getPrisma } from "@/server/db/prisma";

export type MemoryTimelineItem = {
  id: string;
  type: string;
  payload: unknown;
  agentRef: string | null;
  questId: string | null;
  txHash: string | null;
  createdAt: string;
};

export async function fetchMemoryTimeline(
  wallet: string,
  limit = 50,
): Promise<MemoryTimelineItem[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const rows = await prisma.cultureMemoryEvent.findMany({
    where: { wallet: wallet.toLowerCase() },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    payload: row.payload,
    agentRef: row.agentRef,
    questId: row.questId,
    txHash: row.txHash,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function recordCultureMemoryEvent(input: {
  wallet?: string;
  memberId?: string;
  type: string;
  payload?: unknown;
  agentRef?: string;
  questId?: string;
  txHash?: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return prisma.cultureMemoryEvent.create({
    data: {
      wallet: input.wallet?.toLowerCase(),
      memberId: input.memberId,
      type: input.type,
      payload: (input.payload ?? {}) as object,
      agentRef: input.agentRef,
      questId: input.questId,
      txHash: input.txHash,
    },
  });
}
