import type { Prisma, PrismaClient } from "@prisma/client";

type PointsDb = PrismaClient | Prisma.TransactionClient;

export function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

export type CreditPointsInput = {
  walletId: string;
  delta: number;
  reason: string;
  taskSlug?: string | null;
  idempotencyKey: string;
  metadata?: Prisma.InputJsonValue;
};

export type CreditPointsResult = {
  credited: boolean;
  alreadyCredited: boolean;
  pointsGranted: number;
  ledgerId?: string;
};

export async function creditPointsIdempotent(
  prisma: PointsDb,
  input: CreditPointsInput,
): Promise<CreditPointsResult> {
  const existing = await prisma.pointLedgerIdempotency.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    include: { ledger: true },
  });
  if (existing) {
    return {
      credited: false,
      alreadyCredited: true,
      pointsGranted: existing.ledger.delta,
      ledgerId: existing.ledgerId,
    };
  }

  try {
    const ledger = await prisma.pointLedger.create({
      data: {
        walletId: input.walletId,
        delta: input.delta,
        reason: input.reason,
        taskSlug: input.taskSlug ?? null,
        metadata: input.metadata,
      },
    });

    await prisma.pointLedgerIdempotency.create({
      data: {
        idempotencyKey: input.idempotencyKey,
        ledgerId: ledger.id,
      },
    });

    return {
      credited: true,
      alreadyCredited: false,
      pointsGranted: input.delta,
      ledgerId: ledger.id,
    };
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      const replay = await prisma.pointLedgerIdempotency.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { ledger: true },
      });
      if (replay) {
        return {
          credited: false,
          alreadyCredited: true,
          pointsGranted: replay.ledger.delta,
          ledgerId: replay.ledgerId,
        };
      }
    }
    throw error;
  }
}
