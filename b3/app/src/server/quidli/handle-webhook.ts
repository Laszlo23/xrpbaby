import type { PrismaClient } from "@prisma/client";

import { parseQuidliWebhook } from "@/server/quidli/parse-webhook";
import { quidliRewardChainId, quidliRewardTokenAddress } from "@/server/quidli/env";

export type QuidliWebhookResult =
  | { ok: true; stored: boolean; eventId?: string; deliveryId?: string }
  | { ok: false; error: string; status: number };

function verifyQuidliWebhookAuth(request: Request, expectedKey: string): boolean {
  const candidates = [
    request.headers.get("x-quidli-api-key"),
    request.headers.get("x-api-key"),
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
    request.headers.get("authorization")?.replace(/^ApiKey\s+/i, ""),
  ];
  return candidates.some((v) => v?.trim() === expectedKey);
}

async function maybeCreditPointsForDelivery(
  prisma: PrismaClient,
  walletId: string | null | undefined,
  taskSlug: string | null | undefined,
): Promise<void> {
  if (!walletId?.trim() || !taskSlug?.trim()) return;

  const existing = await prisma.pointLedger.findFirst({
    where: { walletId, taskSlug: taskSlug.trim() },
  });
  if (existing) return;

  await prisma.pointLedger.create({
    data: {
      walletId,
      delta: 10,
      taskSlug: taskSlug.trim(),
      reason: "quidli:webhook",
      metadata: { note: "Quidli delivery bonus" },
    },
  });
}

export async function handleQuidliWebhook(
  request: Request,
  prisma: PrismaClient | null,
  apiKey: string,
): Promise<QuidliWebhookResult> {
  if (!verifyQuidliWebhookAuth(request, apiKey)) {
    return { ok: false, error: "unauthorized", status: 401 };
  }

  let payload: unknown = null;
  const raw = await request.text();
  if (raw.trim()) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      payload = { raw: raw.slice(0, 4000) };
    }
  }

  const parsed = parseQuidliWebhook(payload);
  const eventId = parsed?.eventId ?? `raw:${raw.slice(0, 64)}`;

  if (prisma) {
    await prisma.activityEvent.create({
      data: {
        type: "quidli:webhook",
        sourceModule: "quidli",
        payload: (parsed?.raw ?? payload) as object,
      },
    });

    if (parsed) {
      const idempotencyKey = `webhook:${parsed.eventId}`;
      const status =
        parsed.status === "completed"
          ? "completed"
          : parsed.status === "failed"
            ? "failed"
            : "submitted";

      const delivery = await prisma.quidliDelivery.upsert({
        where: { idempotencyKey },
        create: {
          idempotencyKey,
          platform: parsed.platform ?? "unknown",
          handle: parsed.handle ?? "unknown",
          amountWei: parsed.amountWei ?? "0",
          tokenAddress: parsed.tokenAddress?.toLowerCase() ?? quidliRewardTokenAddress(),
          chainId: parsed.chainId ?? quidliRewardChainId(),
          status,
          taskSlug: parsed.taskSlug,
          walletId: parsed.walletId,
          quidliRef: parsed.quidliRef,
          metadata: parsed.raw as object,
        },
        update: {
          status,
          quidliRef: parsed.quidliRef ?? undefined,
          taskSlug: parsed.taskSlug ?? undefined,
          walletId: parsed.walletId ?? undefined,
          metadata: parsed.raw as object,
        },
      });

      if (status === "completed") {
        await maybeCreditPointsForDelivery(prisma, delivery.walletId, delivery.taskSlug);
      }

      return { ok: true, stored: true, eventId, deliveryId: delivery.id };
    }
  }

  return { ok: true, stored: Boolean(prisma), eventId };
}
