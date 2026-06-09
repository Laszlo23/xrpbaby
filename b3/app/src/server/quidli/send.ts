import type { PrismaClient } from "@prisma/client";

import { quidliSendToSocial } from "@/server/quidli/client";
import {
  quidliDefaultAmountWei,
  quidliRewardChainId,
  quidliRewardTokenAddress,
} from "@/server/quidli/env";
import {
  checkQuidliSendPolicy,
  normalizeHandle,
  normalizeQuidliPlatform,
  type QuidliPlatform,
} from "@/server/quidli/policy";

export type QuidliSendRequest = {
  platform: string;
  handle: string;
  amountWei?: string;
  memo?: string;
  idempotencyKey?: string;
  taskSlug?: string;
  campaign?: string;
  walletId?: string;
  memberId?: string;
  dryRun?: boolean;
};

export type QuidliSendOutcome =
  | { ok: true; deliveryId: string; status: string; quidliRef: string | null; reused?: boolean }
  | { ok: false; error: string; detail?: string };

function buildIdempotencyKey(params: QuidliSendRequest, platform: QuidliPlatform, handle: string): string {
  if (params.idempotencyKey?.trim()) return params.idempotencyKey.trim();
  const slug = params.taskSlug?.trim() || params.campaign?.trim() || "send";
  return `${slug}:${platform}:${handle.toLowerCase()}`;
}

export async function executeQuidliSend(
  prisma: PrismaClient,
  params: QuidliSendRequest,
): Promise<QuidliSendOutcome> {
  const platform = normalizeQuidliPlatform(params.platform);
  if (!platform) {
    return { ok: false, error: "invalid_platform" };
  }

  const handle = normalizeHandle(platform, params.handle);
  const amountWei = params.amountWei?.trim() || quidliDefaultAmountWei();
  const idempotencyKey = buildIdempotencyKey(params, platform, handle);

  const existing = await prisma.quidliDelivery.findUnique({
    where: { idempotencyKey },
  });
  if (existing && existing.status !== "failed") {
    return {
      ok: true,
      deliveryId: existing.id,
      status: existing.status,
      quidliRef: existing.quidliRef,
      reused: true,
    };
  }

  const policy = await checkQuidliSendPolicy(prisma, { platform, handle, amountWei });
  if (!policy.ok) {
    return { ok: false, error: policy.reason };
  }

  if (params.dryRun) {
    return { ok: true, deliveryId: "dry-run", status: "dry_run", quidliRef: null };
  }

  const delivery =
    existing ??
    (await prisma.quidliDelivery.create({
      data: {
        idempotencyKey,
        platform,
        handle,
        amountWei,
        tokenAddress: quidliRewardTokenAddress(),
        chainId: quidliRewardChainId(),
        status: "pending",
        taskSlug: params.taskSlug?.trim() || null,
        campaign: params.campaign?.trim() || null,
        walletId: params.walletId?.trim() || null,
        memberId: params.memberId?.trim() || null,
      },
    }));

  const memoParts = [params.memo?.trim(), params.taskSlug ? `task:${params.taskSlug}` : null].filter(
    Boolean,
  );
  const apiResult = await quidliSendToSocial({
    platform,
    handle,
    amountWei,
    memo: memoParts.join(" · ") || undefined,
    idempotencyKey,
  });

  if (!apiResult.ok) {
    await prisma.quidliDelivery.update({
      where: { id: delivery.id },
      data: {
        status: apiResult.error === "api_unreachable_use_dashboard" ? "pending" : "failed",
        error: apiResult.error,
        metadata: { detail: apiResult.detail ?? null },
      },
    });
    return { ok: false, error: apiResult.error, detail: apiResult.detail };
  }

  const updated = await prisma.quidliDelivery.update({
    where: { id: delivery.id },
    data: {
      status: "submitted",
      quidliRef: apiResult.quidliRef,
      metadata: apiResult.raw as object,
      error: null,
    },
  });

  return {
    ok: true,
    deliveryId: updated.id,
    status: updated.status,
    quidliRef: updated.quidliRef,
  };
}
