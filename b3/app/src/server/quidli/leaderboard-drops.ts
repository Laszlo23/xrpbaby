import type { PrismaClient } from "@prisma/client";

import { queryWalletLeaderboard } from "@/server/db/prisma";
import { executeQuidliSend } from "@/server/quidli/send";
import type { QuidliPlatform } from "@/server/quidli/policy";

export type LeaderboardDropResult = {
  ok: boolean;
  weekId: string;
  results: Array<{
    rank: number;
    address: string;
    points: number;
    platform?: QuidliPlatform;
    handle?: string;
    outcome: string;
    deliveryId?: string;
  }>;
};

function isoWeekId(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function resolveSocialTarget(
  prisma: PrismaClient,
  walletAddress: string,
): Promise<{
  platform: QuidliPlatform;
  handle: string;
  walletId: string;
  memberId: string | null;
} | null> {
  const wallet = await prisma.wallet.findFirst({
    where: {
      OR: [{ address: walletAddress }, { address: walletAddress.toLowerCase() }],
    },
    include: {
      member: {
        include: {
          socialAccounts: {
            where: { verified: true, platform: { in: ["telegram", "farcaster"] } },
          },
        },
      },
    },
  });
  if (!wallet) return null;

  const accounts = wallet.member?.socialAccounts ?? [];
  const telegram = accounts.find((a) => a.platform === "telegram");
  if (telegram) {
    const handle = telegram.handle?.trim() || telegram.externalId;
    if (handle) {
      return {
        platform: "telegram",
        handle,
        walletId: wallet.id,
        memberId: wallet.member?.id ?? null,
      };
    }
  }

  const farcaster = accounts.find((a) => a.platform === "farcaster");
  if (farcaster?.handle?.trim()) {
    return {
      platform: "farcaster",
      handle: farcaster.handle.trim(),
      walletId: wallet.id,
      memberId: wallet.member?.id ?? null,
    };
  }

  return null;
}

export async function runQuidliLeaderboardDrops(
  prisma: PrismaClient,
  opts?: { limit?: number; dryRun?: boolean },
): Promise<LeaderboardDropResult> {
  const weekId = isoWeekId();
  const limit = opts?.limit ?? 3;
  const top = await queryWalletLeaderboard(prisma, limit);
  const results: LeaderboardDropResult["results"] = [];

  for (let i = 0; i < top.length; i++) {
    const row = top[i]!;
    const rank = i + 1;
    const target = await resolveSocialTarget(prisma, row.address);
    if (!target) {
      results.push({
        rank,
        address: row.address,
        points: row.points,
        outcome: "no_linked_social",
      });
      continue;
    }

    const send = await executeQuidliSend(prisma, {
      platform: target.platform,
      handle: target.handle,
      campaign: "weekly-leaderboard",
      taskSlug: "quidli-weekly-leaderboard",
      walletId: target.walletId,
      memberId: target.memberId ?? undefined,
      idempotencyKey: `weekly-${weekId}-${target.walletId}`,
      memo: `Building Culture weekly top-${rank} Culture Points`,
      dryRun: opts?.dryRun,
    });

    results.push({
      rank,
      address: row.address,
      points: row.points,
      platform: target.platform,
      handle: target.handle,
      outcome: send.ok ? send.status : send.error,
      deliveryId: send.ok && send.deliveryId !== "dry-run" ? send.deliveryId : undefined,
    });
  }

  return { ok: true, weekId, results };
}
