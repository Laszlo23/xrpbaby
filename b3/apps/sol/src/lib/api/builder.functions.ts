import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { computeBuilderScore } from "@/lib/builder-score";
import { getPrisma } from "@/lib/db.server";
import { getPath } from "@/lib/paths-data";

const walletSchema = z.string().min(32).max(64);

function todayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function updateStreak(builderId: string) {
  const prisma = getPrisma();
  const builder = await prisma.builder.findUniqueOrThrow({ where: { id: builderId } });
  const today = todayUtc();
  const last = builder.lastActiveDate ? new Date(builder.lastActiveDate) : null;

  let streak = builder.streak;
  if (!last) {
    streak = 1;
  } else {
    const lastDay = new Date(last);
    lastDay.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / 86_400_000);
    if (diffDays === 0) {
      streak = builder.streak;
    } else if (diffDays === 1) {
      streak = builder.streak + 1;
    } else {
      streak = 1;
    }
  }

  await prisma.builder.update({
    where: { id: builderId },
    data: { streak, lastActiveDate: new Date() },
  });

  return streak;
}

async function refreshBuilderScore(builderId: string) {
  const prisma = getPrisma();
  const builder = await prisma.builder.findUniqueOrThrow({
    where: { id: builderId },
    include: { achievements: true },
  });
  const score = computeBuilderScore(builder.xp, builder.achievements.length, builder.streak);
  await prisma.builder.update({ where: { id: builderId }, data: { builderScore: score } });
  return score;
}

export const getOrCreateBuilder = createServerFn({ method: "POST" })
  .inputValidator(z.object({ walletAddress: walletSchema }))
  .handler(async ({ data }) => {
    const prisma = getPrisma();
    const builder = await prisma.builder.upsert({
      where: { walletAddress: data.walletAddress },
      create: { walletAddress: data.walletAddress },
      update: {},
    });

    await updateStreak(builder.id);

    const connectMission = await prisma.mission.findUnique({ where: { slug: "connect-wallet" } });
    if (connectMission) {
      const existing = await prisma.missionCompletion.findUnique({
        where: {
          builderId_missionId: { builderId: builder.id, missionId: connectMission.id },
        },
      });
      if (!existing) {
        await prisma.missionCompletion.create({
          data: { builderId: builder.id, missionId: connectMission.id },
        });
      }
    }

    const updated = await prisma.builder.findUniqueOrThrow({
      where: { id: builder.id },
      include: {
        achievements: true,
        completions: { include: { mission: true } },
      },
    });

    await refreshBuilderScore(builder.id);

    return {
      id: updated.id,
      walletAddress: updated.walletAddress,
      xp: updated.xp,
      streak: updated.streak,
      builderScore: updated.builderScore,
      enrolledPathSlug: updated.enrolledPathSlug,
      displayName: updated.displayName,
    };
  });

export const getDashboard = createServerFn({ method: "POST" })
  .inputValidator(z.object({ walletAddress: walletSchema }))
  .handler(async ({ data }) => {
    const prisma = getPrisma();
    const builder = await prisma.builder.findUnique({
      where: { walletAddress: data.walletAddress },
      include: {
        completions: { include: { mission: true } },
        achievements: true,
      },
    });

    if (!builder) {
      return null;
    }

    const missions = await prisma.mission.findMany({ orderBy: { sortOrder: "asc" } });
    const enrolledPath = builder.enrolledPathSlug ? getPath(builder.enrolledPathSlug) : undefined;

    const missionStates = missions.map((mission) => {
      const completion = builder.completions.find((c) => c.missionId === mission.id);
      return {
        slug: mission.slug,
        title: mission.title,
        description: mission.description,
        xpReward: mission.xpReward,
        bccReward: mission.bccReward,
        nftAchievementKey: mission.nftAchievementKey,
        pathSlug: mission.pathSlug,
        status: completion
          ? completion.claimedAt
            ? ("claimed" as const)
            : ("claimable" as const)
          : ("available" as const),
        completedAt: completion?.completedAt?.toISOString(),
        claimedAt: completion?.claimedAt?.toISOString(),
      };
    });

    const pendingClaims = missionStates.filter((m) => m.status === "claimable").length;
    const todayMission =
      missionStates.find((m) => m.status === "available" && !m.pathSlug) ??
      missionStates.find((m) => m.status === "available");

    return {
      walletAddress: builder.walletAddress,
      xp: builder.xp,
      streak: builder.streak,
      builderScore: builder.builderScore,
      enrolledPathSlug: builder.enrolledPathSlug,
      enrolledPathTitle: enrolledPath?.title,
      achievementCount: builder.achievements.length,
      pendingClaims,
      todayMission,
      missions: missionStates,
    };
  });

export const enrollPath = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      walletAddress: walletSchema,
      pathSlug: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const path = getPath(data.pathSlug);
    if (!path) throw new Error("Path not found");

    const prisma = getPrisma();
    const builder = await prisma.builder.findUnique({
      where: { walletAddress: data.walletAddress },
    });
    if (!builder) throw new Error("Builder not found. Connect wallet first.");

    await prisma.builder.update({
      where: { id: builder.id },
      data: { enrolledPathSlug: data.pathSlug },
    });

    const enrollMission = await prisma.mission.findUnique({ where: { slug: "enroll-path" } });
    if (enrollMission) {
      const existing = await prisma.missionCompletion.findUnique({
        where: {
          builderId_missionId: { builderId: builder.id, missionId: enrollMission.id },
        },
      });
      if (!existing) {
        await prisma.missionCompletion.create({
          data: { builderId: builder.id, missionId: enrollMission.id },
        });
      }
    }

    await updateStreak(builder.id);
    await refreshBuilderScore(builder.id);

    return { enrolledPathSlug: data.pathSlug, pathTitle: path.title };
  });

export const completeMission = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      walletAddress: walletSchema,
      missionSlug: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const prisma = getPrisma();
    const builder = await prisma.builder.findUnique({
      where: { walletAddress: data.walletAddress },
    });
    if (!builder) throw new Error("Builder not found. Connect wallet first.");

    const mission = await prisma.mission.findUnique({ where: { slug: data.missionSlug } });
    if (!mission) throw new Error("Mission not found");

    if (mission.pathSlug && builder.enrolledPathSlug !== mission.pathSlug) {
      throw new Error("Enroll in the matching path before completing this mission.");
    }

    const existing = await prisma.missionCompletion.findUnique({
      where: {
        builderId_missionId: { builderId: builder.id, missionId: mission.id },
      },
    });

    if (existing?.claimedAt) {
      return { status: "claimed" as const };
    }

    if (!existing) {
      await prisma.missionCompletion.create({
        data: { builderId: builder.id, missionId: mission.id },
      });
    }

    await updateStreak(builder.id);

    return { status: "claimable" as const };
  });

export const getAchievements = createServerFn({ method: "POST" })
  .inputValidator(z.object({ walletAddress: walletSchema }))
  .handler(async ({ data }) => {
    const prisma = getPrisma();
    const builder = await prisma.builder.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { achievements: { orderBy: { createdAt: "desc" } } },
    });
    if (!builder) return [];
    return builder.achievements.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      mintAddress: a.mintAddress,
      missionSlug: a.missionSlug,
      metadataUri: a.metadataUri,
      createdAt: a.createdAt.toISOString(),
    }));
  });

export const getClaimNonce = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      walletAddress: walletSchema,
      missionSlug: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const nonce = crypto.randomUUID();
    return { nonce };
  });
