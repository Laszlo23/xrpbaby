import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { computeBuilderScore } from "@/lib/builder-score";
import { getPrisma } from "@/lib/db.server";
import { mintAchievementNft } from "@/lib/solana/nft.server";
import { getBccBalance, transferBcc } from "@/lib/solana/token.server";
import { buildClaimMessage } from "@/lib/solana/claim-message";
import { verifyClaimSignature } from "@/lib/solana/verify.server";

const walletSchema = z.string().min(32).max(64);

const NFT_TITLES: Record<string, string> = {
  "first-builder": "First Builder Achievement",
  "path-capstone": "Path Capstone Achievement",
};

export const getBccBalanceFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ walletAddress: walletSchema }))
  .handler(async ({ data }) => {
    const balance = await getBccBalance(data.walletAddress);
    return { balance };
  });

export const claimMissionReward = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      walletAddress: walletSchema,
      missionSlug: z.string().min(1),
      nonce: z.string().uuid(),
      signature: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const valid = verifyClaimSignature(
      data.walletAddress,
      data.missionSlug,
      data.nonce,
      data.signature,
    );
    if (!valid) {
      throw new Error("Invalid signature");
    }

    const prisma = getPrisma();
    const builder = await prisma.builder.findUnique({
      where: { walletAddress: data.walletAddress },
      include: { achievements: true },
    });
    if (!builder) throw new Error("Builder not found");

    const mission = await prisma.mission.findUnique({ where: { slug: data.missionSlug } });
    if (!mission) throw new Error("Mission not found");

    const completion = await prisma.missionCompletion.findUnique({
      where: {
        builderId_missionId: { builderId: builder.id, missionId: mission.id },
      },
    });
    if (!completion) throw new Error("Mission not completed yet");
    if (completion.claimedAt) throw new Error("Reward already claimed");

    const txSignatures: string[] = [];
    let nftMint: string | undefined;

    if (mission.bccReward > 0) {
      const sig = await transferBcc(data.walletAddress, mission.bccReward);
      txSignatures.push(sig);
    }

    if (mission.nftAchievementKey) {
      const title =
        NFT_TITLES[mission.nftAchievementKey] ?? `BCA Achievement: ${mission.nftAchievementKey}`;
      nftMint = await mintAchievementNft(data.walletAddress, {
        title,
        achievementKey: mission.nftAchievementKey,
        missionSlug: mission.slug,
        walletAddress: data.walletAddress,
      });

      await prisma.achievement.create({
        data: {
          builderId: builder.id,
          type: "nft",
          title,
          mintAddress: nftMint,
          missionSlug: mission.slug,
          metadataUri: `achievement://${mission.nftAchievementKey}`,
        },
      });
    } else if (mission.bccReward > 0 || mission.xpReward > 0) {
      await prisma.achievement.create({
        data: {
          builderId: builder.id,
          type: "badge",
          title: mission.title,
          missionSlug: mission.slug,
        },
      });
    }

    const newXp = builder.xp + mission.xpReward;
    const achievementCount =
      builder.achievements.length + (mission.nftAchievementKey || mission.xpReward > 0 ? 1 : 0);
    const builderScore = computeBuilderScore(newXp, achievementCount, builder.streak);

    await prisma.builder.update({
      where: { id: builder.id },
      data: { xp: newXp, builderScore },
    });

    await prisma.missionCompletion.update({
      where: { id: completion.id },
      data: {
        claimedAt: new Date(),
        txSignature: txSignatures[0] ?? null,
        nftMint: nftMint ?? null,
      },
    });

    return {
      xpEarned: mission.xpReward,
      bccEarned: mission.bccReward,
      nftMint,
      txSignatures,
      message: buildClaimMessage(data.walletAddress, data.missionSlug, data.nonce),
    };
  });
