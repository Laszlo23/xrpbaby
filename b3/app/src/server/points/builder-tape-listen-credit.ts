import type { PrismaClient } from "@prisma/client";

import {
  BUILDER_TAPES,
  BUILDER_TAPES_COMPLETE_ALL_SLUG,
  BUILDER_TAPE_LISTEN_THRESHOLD,
  builderTapeListenTaskSlug,
  getBuilderTape,
} from "@/content/builder-tapes";
import { ensureWalletAndMember } from "@/server/platform/member";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";
import { ensureDefaultTasks } from "@/server/points/tasks";

export type BuilderTapeListenResult = {
  ok: boolean;
  balance: number;
  alreadyCompleted: boolean;
  seriesJustCompleted?: boolean;
  error?: string;
};

async function walletBalance(prisma: PrismaClient, walletId: string): Promise<number> {
  const agg = await prisma.pointLedger.aggregate({
    where: { walletId },
    _sum: { delta: true },
  });
  return agg._sum.delta ?? 0;
}

async function hasTaskCompletion(
  prisma: PrismaClient,
  walletId: string,
  taskSlug: string,
): Promise<boolean> {
  const row = await prisma.pointLedger.findFirst({
    where: { walletId, taskSlug, reason: "task_completion" },
  });
  return !!row;
}

async function creditTaskOnce(
  prisma: PrismaClient,
  walletId: string,
  memberId: string | undefined,
  taskSlug: string,
  points: number,
): Promise<boolean> {
  const existing = await prisma.pointLedger.findFirst({
    where: { walletId, taskSlug, reason: "task_completion" },
  });
  if (existing) return false;

  if (points > 0) {
    await prisma.pointLedger.create({
      data: {
        walletId,
        delta: points,
        reason: "task_completion",
        taskSlug,
      },
    });
  }

  const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
  await logTaskCompletionActivity(prisma, { memberId, taskSlug });

  return true;
}

export async function creditBuilderTapeListen(
  prisma: PrismaClient,
  input: {
    address: string;
    slug: string;
    listenedSeconds: number;
    durationSeconds: number;
  },
): Promise<BuilderTapeListenResult> {
  const tape = getBuilderTape(input.slug);
  if (!tape) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_episode" };
  }

  if (input.durationSeconds < 30) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "duration_too_short" };
  }

  const ratio = input.listenedSeconds / input.durationSeconds;
  if (ratio < BUILDER_TAPE_LISTEN_THRESHOLD) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "listen_threshold_not_met" };
  }

  await ensureDefaultTasks(prisma);

  const taskSlug = builderTapeListenTaskSlug(input.slug);
  const task = await prisma.taskDefinition.findUnique({ where: { slug: taskSlug } });
  if (!task || !task.active) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
  }

  const addr = input.address.toLowerCase();
  const { wallet } = await ensureWalletAndMember(prisma, addr);

  const member = await prisma.member.findFirst({
    where: { walletId: wallet.id },
    select: { id: true },
  });

  const already = await hasTaskCompletion(prisma, wallet.id, taskSlug);
  if (already) {
    return {
      ok: true,
      alreadyCompleted: true,
      balance: await walletBalance(prisma, wallet.id),
    };
  }

  await creditTaskOnce(prisma, wallet.id, member?.id, taskSlug, task.points);

  await recordCultureMemoryEvent({
    wallet: addr,
    memberId: member?.id,
    type: "builder_tape_listen",
    questId: taskSlug,
    payload: { slug: tape.slug, title: tape.title },
  });

  let seriesJustCompleted = false;
  const allListenSlugs = BUILDER_TAPES.map((t) => builderTapeListenTaskSlug(t.slug));
  const completedCount = await Promise.all(
    allListenSlugs.map((s) => hasTaskCompletion(prisma, wallet.id, s)),
  );
  const allDone = completedCount.every(Boolean);

  if (allDone) {
    const completeTask = await prisma.taskDefinition.findUnique({
      where: { slug: BUILDER_TAPES_COMPLETE_ALL_SLUG },
    });
    if (completeTask?.active) {
      const seriesNew = await creditTaskOnce(
        prisma,
        wallet.id,
        member?.id,
        BUILDER_TAPES_COMPLETE_ALL_SLUG,
        completeTask.points,
      );
      if (seriesNew) {
        seriesJustCompleted = true;
        await recordCultureMemoryEvent({
          wallet: addr,
          memberId: member?.id,
          type: "builder_tapes_complete",
          questId: BUILDER_TAPES_COMPLETE_ALL_SLUG,
          payload: { episodeCount: BUILDER_TAPES.length },
        });
      }
    }
  }

  return {
    ok: true,
    alreadyCompleted: false,
    balance: await walletBalance(prisma, wallet.id),
    seriesJustCompleted,
  };
}
