import type { PrismaClient } from "@prisma/client";

import {
  quidliDailySendCapUsd,
  quidliMaxPerRecipientUsd,
  quidliRewardTokenAddress,
} from "@/server/quidli/env";

export type QuidliPlatform = "twitter" | "farcaster" | "telegram" | "email" | "github";

const ALLOWED_PLATFORMS = new Set<QuidliPlatform>([
  "twitter",
  "farcaster",
  "telegram",
  "email",
  "github",
]);

/** Map app social platform names to Quidli API platform ids. */
export function normalizeQuidliPlatform(raw: string): QuidliPlatform | null {
  const p = raw.trim().toLowerCase();
  if (p === "x" || p === "twitter") return "twitter";
  if (p === "farcaster" || p === "fc") return "farcaster";
  if (p === "telegram" || p === "tg") return "telegram";
  if (p === "email") return "email";
  if (p === "github" || p === "gh") return "github";
  return null;
}

export function isAllowedQuidliPlatform(platform: QuidliPlatform): boolean {
  return ALLOWED_PLATFORMS.has(platform);
}

export function normalizeHandle(platform: QuidliPlatform, handle: string): string {
  const h = handle.trim();
  if (platform === "twitter" || platform === "farcaster") {
    return h.replace(/^@/, "");
  }
  if (platform === "telegram") {
    return h.replace(/^@/, "");
  }
  return h;
}

/** Rough USD estimate for cap checks (BCC treated ~$0.001 unless price env set). */
export function estimateAmountUsd(amountWei: string): number {
  const bccPrice = Number(process.env.QUIDLI_BCC_PRICE_USD ?? "0.001");
  const price = Number.isFinite(bccPrice) && bccPrice > 0 ? bccPrice : 0.001;
  try {
    const wei = BigInt(amountWei);
    const tokens = Number(wei) / 1e18;
    return tokens * price;
  } catch {
    return quidliMaxPerRecipientUsd() + 1;
  }
}

export async function quidliSpendTodayUsd(prisma: PrismaClient): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.quidliDelivery.findMany({
    where: {
      createdAt: { gte: start },
      status: { in: ["submitted", "completed", "pending"] },
      tokenAddress: quidliRewardTokenAddress(),
    },
    select: { amountWei: true },
  });
  return rows.reduce((sum, r) => sum + estimateAmountUsd(r.amountWei), 0);
}

export type PolicyCheckResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function checkQuidliSendPolicy(
  prisma: PrismaClient,
  params: { platform: QuidliPlatform; handle: string; amountWei: string },
): Promise<PolicyCheckResult> {
  if (!isAllowedQuidliPlatform(params.platform)) {
    return { ok: false, reason: "platform_not_allowed" };
  }
  if (!params.handle.trim()) {
    return { ok: false, reason: "handle_required" };
  }

  const amountUsd = estimateAmountUsd(params.amountWei);
  if (amountUsd > quidliMaxPerRecipientUsd()) {
    return { ok: false, reason: "per_recipient_cap_exceeded" };
  }

  const spentToday = await quidliSpendTodayUsd(prisma);
  if (spentToday + amountUsd > quidliDailySendCapUsd()) {
    return { ok: false, reason: "daily_cap_exceeded" };
  }

  return { ok: true };
}
