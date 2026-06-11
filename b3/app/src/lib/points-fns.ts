import { createServerFn } from "@tanstack/react-start";
import type { Address, Hex } from "viem";
import { z } from "zod";
import { createHash } from "node:crypto";

import { isPlausibleTwitterStatusUrl } from "@/lib/twitter-intents";
import { isPlausibleTelegramProofUrl } from "@/lib/telegram-proof";
import { ensureWalletAndMember } from "@/server/platform/member";

const addressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const taskCompleteSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  taskSlug: z.string().min(1).max(64),
});

const farcasterSocialTaskSlugSchema = z.enum([
  "follow-farcaster",
  "like-cast-farcaster",
  "share-app-farcaster",
]);

const farcasterSocialCompleteSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  taskSlug: farcasterSocialTaskSlugSchema,
});

function farcasterSocialErrorMessage(code: string): string {
  switch (code) {
    case "no_database":
      return "Points server has no database — set DATABASE_URL on the deploy host.";
    case "neynar_not_configured":
      return "Server is missing NEYNAR_API_KEY.";
    case "no_farcaster_for_wallet":
      return "No Farcaster profile linked to this wallet in Neynar. Add your wallet in Warpcast → Account → Verified addresses (or use the custody-linked wallet).";
    case "neynar_target_fid_unset":
    case "neynar_target_fid_invalid":
      return "Follow task: server needs NEYNAR_TARGET_FID or a Warpcast profile URL (FARCASTER_FOLLOW_URL or VITE_FARCASTER_FOLLOW_URL).";
    case "neynar_cast_unconfigured":
      return "Like task: server needs NEYNAR_TARGET_CAST, FARCASTER_TARGET_CAST_URL, or VITE_FARCASTER_TARGET_CAST_URL.";
    case "not_following":
      return "We could not verify that you follow this account yet.";
    case "cast_not_liked":
      return "We could not verify a like on the target cast yet.";
    case "share_host_unconfigured":
      return "Share task: set PUBLIC_APP_ORIGIN / NEYNAR_SHARE_HOST so we know which domain to match.";
    case "share_not_found":
      return "We could not find a cast from you that links or mentions this site yet. Post again, wait a minute, then verify.";
    case "unknown_task":
      return "Unknown Farcaster task.";
    default:
      return code;
  }
}

/** Public read of aggregated points + which task slugs already credited (best-effort). */
export const postPointsBalance = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => addressSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      balance: number;
      completedSlugs?: string[];
      dailyCheckInToday?: boolean;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { walletDailyCheckInCreditedToday } = await import(
        "@/server/points/daily-checkin-credit"
      );
      const prisma = getPrisma();
      if (!prisma) {
        return {
          ok: false,
          reason: "no_database",
          balance: 0,
          completedSlugs: [],
          dailyCheckInToday: false,
        };
      }
      const addr = data.address.toLowerCase();
      const wallet = await prisma.wallet.findUnique({ where: { address: addr } });
      if (!wallet) {
        return { ok: true, balance: 0, completedSlugs: [], dailyCheckInToday: false };
      }
      const agg = await prisma.pointLedger.aggregate({
        where: { walletId: wallet.id },
        _sum: { delta: true },
      });
      const ledgerTasks = await prisma.pointLedger.findMany({
        where: {
          walletId: wallet.id,
          reason: "task_completion",
          taskSlug: { not: null },
        },
        select: { taskSlug: true },
      });
      const completedSlugs = [
        ...new Set(
          ledgerTasks
            .map((r) => r.taskSlug)
            .filter((s): s is string => typeof s === "string" && s.length > 0),
        ),
      ];
      const dailyCheckInToday = await walletDailyCheckInCreditedToday(prisma, wallet.id);
      return { ok: true, balance: agg._sum.delta ?? 0, completedSlugs, dailyCheckInToday };
    },
  );

/** SIWE-gated one-time task reward. */
export const postCompleteTaskWithSiwe = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => taskCompleteSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        await ensureDefaultTasks(prisma);

        const task = await prisma.taskDefinition.findUnique({ where: { slug: data.taskSlug } });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const addr = address.toLowerCase();
        const { wallet } = await ensureWalletAndMember(prisma, addr);

        if (data.taskSlug === "bcc-lp-proof") {
          const { walletHasBccLpProof } = await import("@/server/liquidity/lp-proof");
          const lp = await walletHasBccLpProof(address as Address);
          if (!lp.ok) {
            return {
              ok: false,
              balance: 0,
              alreadyCompleted: false,
              error: lp.error ?? "lp_proof_required",
            };
          }
        }

        if (data.taskSlug === "bcc-roots-stake") {
          const { walletHasRootsStakeProof } = await import("@/server/roots/stake-proof");
          const stake = await walletHasRootsStakeProof(address as Address);
          if (!stake.ok) {
            return {
              ok: false,
              balance: 0,
              alreadyCompleted: false,
              error: stake.error ?? "roots_stake_required",
            };
          }
        }

        const existing = await prisma.pointLedger.findFirst({
          where: {
            walletId: wallet.id,
            taskSlug: data.taskSlug,
            reason: "task_completion",
          },
        });
        if (existing) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return {
            ok: true,
            alreadyCompleted: true,
            balance: agg._sum.delta ?? 0,
          };
        }

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: data.taskSlug,
            },
          });
        }

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return {
          ok: true,
          alreadyCompleted: false,
          balance: agg._sum.delta ?? 0,
        };
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "siwe_error",
        };
      }
    },
  );

/** SIWE + Neynar-verified Farcaster social quests (follow / like / share). */
export const postCompleteFarcasterSocialTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => farcasterSocialCompleteSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");
      const { verifyFarcasterSocialTask } = await import("@/server/neynar/farcaster-social-verify");

      const prisma = getPrisma();
      if (!prisma) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: farcasterSocialErrorMessage("no_database"),
        };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        await ensureDefaultTasks(prisma);

        const task = await prisma.taskDefinition.findUnique({ where: { slug: data.taskSlug } });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const proof = await verifyFarcasterSocialTask(data.taskSlug, address as `0x${string}`);
        if (!proof.ok) {
          return {
            ok: false,
            balance: 0,
            alreadyCompleted: false,
            error: farcasterSocialErrorMessage(proof.code),
          };
        }

        const addr = address.toLowerCase();
        const { wallet, member } = await ensureWalletAndMember(prisma, addr);

        if (!member.farcasterFid) {
          const { syncMemberSupportScore } = await import("@/server/social/support-score-sync");
          await syncMemberSupportScore(prisma, member.id).catch(() => {});
        }

        const existing = await prisma.pointLedger.findFirst({
          where: {
            walletId: wallet.id,
            taskSlug: data.taskSlug,
            reason: "task_completion",
          },
        });
        if (existing) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return {
            ok: true,
            alreadyCompleted: true,
            balance: agg._sum.delta ?? 0,
          };
        }

        if (task.points > 0) {
          const { resolveTargetSupportMultiplier, applyPointsMultiplier } =
            await import("@/server/social/reward-multiplier");
          let awarded = task.points;
          let multiplier = 1;
          if (data.taskSlug === "follow-farcaster") {
            const rawTarget = process.env.NEYNAR_TARGET_FID?.trim();
            const targetFid = rawTarget ? Number.parseInt(rawTarget, 10) : null;
            const resolved = await resolveTargetSupportMultiplier(
              prisma,
              Number.isFinite(targetFid) && targetFid! > 0 ? targetFid : null,
            );
            multiplier = resolved.multiplier;
            awarded = applyPointsMultiplier(task.points, multiplier);
          }
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: awarded,
              reason: "task_completion",
              taskSlug: data.taskSlug,
              metadata:
                multiplier > 1
                  ? ({ supportMultiplier: multiplier, basePoints: task.points } as object)
                  : undefined,
            },
          });
        }

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return {
          ok: true,
          alreadyCompleted: false,
          balance: agg._sum.delta ?? 0,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "neynar_error";
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: msg === "neynar_cast_not_found" ? "Could not resolve that cast in Neynar." : msg,
        };
      }
    },
  );

const leaderboardInputSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
});

/** Top wallets by summed PointLedger — requires Postgres + DATABASE_URL. */
export const postLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => leaderboardInputSchema.parse(raw ?? {}))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      rows: Array<{ address: string; points: number }>;
    }> => {
      const { getPrisma, queryWalletLeaderboard } = await import("@/server/db/prisma");
      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, reason: "no_database", rows: [] };
      }
      const limit = data.limit ?? 50;
      const rows = await queryWalletLeaderboard(prisma, limit);
      return { ok: true, rows };
    },
  );

/** Top referrers by raffle-referral bonus points (last 30 days). */
export const postReferralLeaderboard30d = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => leaderboardInputSchema.parse(raw ?? {}))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      rows: Array<{ address: string; points: number }>;
    }> => {
      const { getPrisma, queryReferralLeaderboard30d } = await import("@/server/db/prisma");
      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, reason: "no_database", rows: [] };
      }
      const limit = data.limit ?? 12;
      const rows = await queryReferralLeaderboard30d(prisma, limit);
      return { ok: true, rows };
    },
  );

const telegramProofTaskSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  taskSlug: z.literal("telegram-join-buildingculture"),
  proofUrl: z.string().url(),
});

/** One-time Telegram quest — paste a t.me / telegram.me link after joining (audit trail). */
export const postCompleteTelegramProofTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => telegramProofTaskSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");

      if (!isPlausibleTelegramProofUrl(data.proofUrl)) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: "Proof must be a t.me or telegram.me link.",
        };
      }

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        await ensureDefaultTasks(prisma);

        const task = await prisma.taskDefinition.findUnique({
          where: { slug: data.taskSlug },
        });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const addr = address.toLowerCase();
        const { wallet } = await ensureWalletAndMember(prisma, addr);

        const existing = await prisma.pointLedger.findFirst({
          where: {
            walletId: wallet.id,
            taskSlug: data.taskSlug,
            reason: "task_completion",
          },
        });
        if (existing) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return {
            ok: true,
            alreadyCompleted: true,
            balance: agg._sum.delta ?? 0,
          };
        }

        const metadata = { proofUrl: data.proofUrl, network: "telegram" as const };

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: data.taskSlug,
              metadata,
            },
          });
        }

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return {
          ok: true,
          alreadyCompleted: false,
          balance: agg._sum.delta ?? 0,
        };
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "telegram_proof_error",
        };
      }
    },
  );

const xProofTaskSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  taskSlug: z.enum(["x-reply-official", "x-retweet-official", "x-quote-official"]),
  proofUrl: z
    .string()
    .trim()
    .min(10)
    .refine((u) => isPlausibleTwitterStatusUrl(u), {
      message: "Proof must be an x.com or twitter.com /status/… link.",
    }),
});

/** One-time X quests — paste your tweet URL after completing the action (moderation-friendly audit trail). */
export const postCompleteXProofTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => xProofTaskSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");

      if (!isPlausibleTwitterStatusUrl(data.proofUrl)) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: "Proof must be a twitter.com or x.com /status/… link.",
        };
      }

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        await ensureDefaultTasks(prisma);

        const task = await prisma.taskDefinition.findUnique({ where: { slug: data.taskSlug } });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const addr = address.toLowerCase();
        const { wallet } = await ensureWalletAndMember(prisma, addr);

        const existing = await prisma.pointLedger.findFirst({
          where: {
            walletId: wallet.id,
            taskSlug: data.taskSlug,
            reason: "task_completion",
          },
        });
        if (existing) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return {
            ok: true,
            alreadyCompleted: true,
            balance: agg._sum.delta ?? 0,
          };
        }

        const { getTwitterUserClient } = await import("@/server/x/twitter-client");
        const { resolveOfficialQuestTargetTweetId, verifyXProofTweet } =
          await import("@/server/x/verify-proof");
        const xClient = getTwitterUserClient();
        if (xClient) {
          const targetTweetId = resolveOfficialQuestTargetTweetId();
          if (!targetTweetId) {
            return {
              ok: false,
              balance: 0,
              alreadyCompleted: false,
              error: "x_api_unconfigured",
            };
          }
          const verified = await verifyXProofTweet(
            xClient,
            data.proofUrl,
            data.taskSlug,
            targetTweetId,
          );
          if (!verified.ok) {
            return {
              ok: false,
              balance: 0,
              alreadyCompleted: false,
              error: verified.error,
            };
          }
        }

        const metadata = { proofUrl: data.proofUrl, network: "x" as const };

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: data.taskSlug,
              metadata,
            },
          });
        }

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return {
          ok: true,
          alreadyCompleted: false,
          balance: agg._sum.delta ?? 0,
        };
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "x_proof_error",
        };
      }
    },
  );

const dailyCheckInSchema = z
  .object({
    message: z.string().min(10),
    signature: z.string().min(10),
    txHash: z
      .string()
      .regex(/^0x[a-fA-F0-9]{64}$/)
      .optional(),
    chainId: z.number().int().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.txHash && val.chainId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "chainId required when txHash is set",
        path: ["chainId"],
      });
    }
  });

function mergeProofEnv(): Record<string, string | undefined> {
  const e: Record<string, string | undefined> = {};
  if (typeof import.meta !== "undefined" && import.meta.env) {
    Object.assign(e, import.meta.env as Record<string, string | undefined>);
  }
  if (typeof process !== "undefined" && process.env) {
    Object.assign(e, process.env as Record<string, string | undefined>);
  }
  return e;
}

/** Awards points once per UTC day — on-chain tx and/or SIWE-only when contract is not deployed. */
export const postCompleteDailyChainCheckIn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => dailyCheckInSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      bonusGranted?: boolean;
      bonusPoints?: number;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { creditDailyCheckInPoints } = await import("@/server/points/daily-checkin-credit");
      const { verifyDailyCheckInTx } = await import("@bc/proof");
      const { utcCheckInDayIndex } = await import("@/lib/daily-checkin");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }

      try {
        const address = await verifySiweSignature(data.message, data.signature);

        if (data.txHash) {
          const proof = await verifyDailyCheckInTx({
            txHash: data.txHash as Hex,
            expectedWallet: address as Address,
            chainId: data.chainId!,
            getEnv: () => mergeProofEnv(),
          });

          if (!proof.ok) {
            const msg =
              proof.code === "contract_not_configured"
                ? "Server missing DAILY_CHECKIN_CONTRACT_ADDRESS."
                : proof.code === "wrong_chain"
                  ? "Switch to Base mainnet."
                  : proof.code === "tx_failed"
                    ? "Transaction failed on-chain."
                    : proof.code === "wrong_signer"
                      ? "Wallet must match transaction sender."
                      : proof.code === "no_checkin_event"
                        ? "That transaction is not a daily check-in."
                        : proof.code === "wrong_user_event"
                          ? "Check-in address mismatch."
                          : proof.code;
            return { ok: false, balance: 0, alreadyCompleted: false, error: msg };
          }

          return creditDailyCheckInPoints(prisma, {
            address,
            message: data.message,
            signature: data.signature,
            mode: "onchain",
            txHash: data.txHash,
            dayIndex: proof.dayIndex.toString(),
          });
        }

        return creditDailyCheckInPoints(prisma, {
          address,
          message: data.message,
          signature: data.signature,
          mode: "siwe",
          dayIndex: utcCheckInDayIndex().toString(),
        });
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "daily_error",
        };
      }
    },
  );

const panicVoucherClaimSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  sessionId: z.string().min(6).max(128),
  precisionScore: z.number().int().min(0).max(777),
  clueFingerprint: z.string().min(4).max(256),
  riddleAnswer: z.string().min(2).max(128),
});

function normalizeRiddleAnswer(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function readExpectedRiddleAnswerHash(): string {
  const raw = process.env.PANIC_VOUCHER_RIDDLE_ANSWER_SHA256?.trim().toLowerCase();
  if (raw && /^[a-f0-9]{64}$/.test(raw)) return raw;
  return "70edb47a07092e72e4bcfdaa9608ad9bccf4483c67c1429f6b77baad159de6e3";
}

/** Lifetime SIWE-gated hidden riddle claim that mints a Panic Switch voucher NFT on Base. */
export const postClaimPanicSwitchVoucherNft = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => panicVoucherClaimSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      alreadyCompleted: boolean;
      claimId?: string;
      txHash?: string;
      tokenId?: string | null;
      chainId?: number;
      contractAddress?: string;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");
      const { tryMintPanicVoucherNft } = await import("@/server/wallet/panic-voucher-mint");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, alreadyCompleted: false, error: "no_database" };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        await ensureDefaultTasks(prisma);
        const task = await prisma.taskDefinition.findUnique({
          where: { slug: "panic-switch-voucher-nft-claim" },
        });
        if (!task || !task.active) {
          return { ok: false, alreadyCompleted: false, error: "invalid_task" };
        }

        const normalizedAnswer = normalizeRiddleAnswer(data.riddleAnswer);
        const answerHash = createHash("sha256").update(normalizedAnswer).digest("hex");
        if (answerHash !== readExpectedRiddleAnswerHash()) {
          return { ok: false, alreadyCompleted: false, error: "riddle_incorrect" };
        }
        if (data.precisionScore < 640) {
          return { ok: false, alreadyCompleted: false, error: "precision_too_low" };
        }

        const addr = address.toLowerCase();
        const { wallet, member } = await ensureWalletAndMember(prisma, addr);

        const existingClaim = await prisma.panicVoucherClaim.findUnique({
          where: { walletId: wallet.id },
        });
        if (existingClaim) {
          return {
            ok: true,
            alreadyCompleted: true,
            claimId: existingClaim.id,
            txHash: existingClaim.txHash ?? undefined,
            tokenId: existingClaim.tokenId ?? null,
            chainId: existingClaim.chainId ?? undefined,
            contractAddress: existingClaim.contractAddress ?? undefined,
          };
        }

        const dayUTC = new Date().toISOString().slice(0, 10);
        const priorPanicRows = await prisma.pointLedger.findMany({
          where: { walletId: wallet.id, taskSlug: "panic-switch-bcc-daily" },
          orderBy: { createdAt: "desc" },
          take: 8,
        });
        const hasQualifiedPanicRun = priorPanicRows.some((row) => {
          const m = row.metadata as { dayUTC?: string; precisionScore?: number } | null;
          return (
            m?.dayUTC === dayUTC && typeof m.precisionScore === "number" && m.precisionScore >= 600
          );
        });
        if (!hasQualifiedPanicRun) {
          return {
            ok: false,
            alreadyCompleted: false,
            error: "voucher_requires_today_attested_run",
          };
        }

        const sessionIdHash = createHash("sha256").update(data.sessionId).digest("hex");
        const clueFingerprintHash = createHash("sha256").update(data.clueFingerprint).digest("hex");
        const claimDigestHex = createHash("sha256")
          .update(
            `${addr}|${dayUTC}|${data.sessionId}|${data.precisionScore}|${clueFingerprintHash}`,
          )
          .digest("hex");
        const claimDigest = `0x${claimDigestHex}` as Hex;

        const mint = await tryMintPanicVoucherNft({
          to: addr as Address,
          claimDigest,
        });

        const created = await prisma.panicVoucherClaim.create({
          data: {
            memberId: member.id,
            walletId: wallet.id,
            dayUTC,
            sessionIdHash,
            clueFingerprintHash,
            riddleAnswerHash: answerHash,
            claimDigest: claimDigestHex,
            precisionScore: data.precisionScore,
            status: mint.ok ? "minted" : "pending",
            chainId: mint.ok ? mint.chainId : null,
            contractAddress: mint.ok ? mint.contractAddress : null,
            txHash: mint.ok ? mint.txHash : null,
            tokenId: mint.ok ? mint.tokenId : null,
            mintedAt: mint.ok ? new Date() : null,
          },
        });

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: "panic-switch-voucher-nft-claim",
              metadata: {
                dayUTC,
                claimId: created.id,
                precisionScore: data.precisionScore,
                status: mint.ok ? "minted" : "pending",
                txHash: mint.ok ? mint.txHash : null,
                tokenId: mint.ok ? mint.tokenId : null,
                clueFingerprintHash,
                sessionIdHash,
              },
            },
          });
        }

        await prisma.activityEvent.create({
          data: {
            memberId: member.id,
            type: "panic:voucher_nft_claimed",
            sourceModule: "panic-switch",
            payload: {
              claimId: created.id,
              status: created.status,
              txHash: created.txHash,
              tokenId: created.tokenId,
              precisionScore: data.precisionScore,
            },
          },
        });

        return {
          ok: true,
          alreadyCompleted: false,
          claimId: created.id,
          txHash: created.txHash ?? undefined,
          tokenId: created.tokenId ?? null,
          chainId: created.chainId ?? undefined,
          contractAddress: created.contractAddress ?? undefined,
          error: !mint.ok ? `mint_pending:${mint.error}` : undefined,
        };
      } catch (e) {
        return {
          ok: false,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "panic_voucher_claim_error",
        };
      }
    },
  );

const eliasXpSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  planId: z.string().uuid(),
});

/** SIWE — credits once after staff marks an Elias plan confirmed; wallet must match linked Elias guest wallet. */
export const postCompleteEliasPlanConfirmed = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => eliasXpSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");
      const { getPlanConfirmationContext } = await import("@/server/elias/elias-store");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }

      try {
        const address = await verifySiweSignature(data.message, data.signature);
        const ctx = await getPlanConfirmationContext(data.planId);
        if (!ctx) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "plan_not_found" };
        }
        if (ctx.status !== "confirmed") {
          return {
            ok: false,
            balance: 0,
            alreadyCompleted: false,
            error: "plan_not_confirmed_yet",
          };
        }
        if (!ctx.walletAddress || ctx.walletAddress.toLowerCase() !== address.toLowerCase()) {
          return {
            ok: false,
            balance: 0,
            alreadyCompleted: false,
            error: "wallet_mismatch_or_not_linked",
          };
        }

        await ensureDefaultTasks(prisma);
        const task = await prisma.taskDefinition.findUnique({
          where: { slug: "elias-plan-confirmed" },
        });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const addr = address.toLowerCase();
        const { wallet } = await ensureWalletAndMember(prisma, addr);

        const existing = await prisma.pointLedger.findFirst({
          where: {
            walletId: wallet.id,
            taskSlug: "elias-plan-confirmed",
            reason: "task_completion",
          },
        });
        if (existing) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return {
            ok: true,
            alreadyCompleted: true,
            balance: agg._sum.delta ?? 0,
          };
        }

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: "elias-plan-confirmed",
              metadata: { planId: data.planId, kind: "elias_confirmed" },
            },
          });
        }

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return {
          ok: true,
          alreadyCompleted: false,
          balance: agg._sum.delta ?? 0,
        };
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "elias_xp_error",
        };
      }
    },
  );

const panicBccRewardSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  sessionId: z.string().min(6).max(128),
  precisionScore: z.number().int().min(0).max(777),
});

function readPanicBccRewardWei(): bigint {
  const raw = process.env.PANIC_SWITCH_BCC_REWARD_WEI?.trim();
  if (!raw) return 77_000_000_000_000_000n; // 0.077 BCC default
  try {
    const parsed = BigInt(raw);
    return parsed > 0n ? parsed : 77_000_000_000_000_000n;
  } catch {
    return 77_000_000_000_000_000n;
  }
}

/** Daily SIWE-gated panic-switch completion reward, queued as BCC settlement obligation. */
export const postClaimPanicSwitchBccReward = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => panicBccRewardSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      alreadyCompleted: boolean;
      bccRewardWei?: string;
      settlementId?: string;
      onchainSettled?: boolean;
      onchainTxHash?: string;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        await ensureDefaultTasks(prisma);
        const task = await prisma.taskDefinition.findUnique({
          where: { slug: "panic-switch-bcc-daily" },
        });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const addr = address.toLowerCase();
        const { wallet, member } = await ensureWalletAndMember(prisma, addr);
        const dayUTC = new Date().toISOString().slice(0, 10);

        const prior = await prisma.pointLedger.findMany({
          where: { walletId: wallet.id, taskSlug: "panic-switch-bcc-daily" },
        });
        const alreadyToday = prior.some((row) => {
          const m = row.metadata as { dayUTC?: string } | null;
          return m?.dayUTC === dayUTC;
        });
        if (alreadyToday) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return {
            ok: true,
            alreadyCompleted: true,
            balance: agg._sum.delta ?? 0,
          };
        }

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: "panic-switch-bcc-daily",
              metadata: {
                dayUTC,
                sessionId: data.sessionId,
                precisionScore: data.precisionScore,
                kind: "panic_switch_daily_attestation",
                siweMessageSha256: createHash("sha256").update(data.message).digest("hex"),
                siweSignatureSha256: createHash("sha256").update(data.signature).digest("hex"),
              },
            },
          });
        }

        const baseRewardWei = readPanicBccRewardWei();
        const precisionBonusWei =
          data.precisionScore >= 700
            ? 23_000_000_000_000_000n
            : data.precisionScore >= 600
              ? 11_000_000_000_000_000n
              : 0n;
        const rewardWei = baseRewardWei + precisionBonusWei;
        const { trySendPanicBccReward } = await import("@/server/wallet/panic-bcc-payout");
        const payout = await trySendPanicBccReward({
          to: addr as Address,
          amountWei: rewardWei,
        });

        const settlement = await prisma.bccSettlement.create({
          data: {
            memberId: member.id,
            walletId: wallet.id,
            packSlug: "panic-switch-bcc-daily",
            stripeSessionId: null,
            usdCents: 0,
            bccOwedWei: rewardWei.toString(),
            bonusBccWei: "0",
            status: payout.ok ? "credited" : "pending",
            note: payout.ok
              ? `On-chain transfer sent: tx ${payout.txHash} on chain ${payout.chainId} (session ${data.sessionId}, precision ${data.precisionScore}/777)`
              : `Queued for treasury settlement (${payout.mode}): ${payout.error}. session ${data.sessionId}, precision ${data.precisionScore}/777`,
            creditedAt: payout.ok ? new Date() : null,
          },
        });

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return {
          ok: true,
          alreadyCompleted: false,
          balance: agg._sum.delta ?? 0,
          bccRewardWei: rewardWei.toString(),
          settlementId: settlement.id,
          onchainSettled: payout.ok,
          onchainTxHash: payout.ok ? payout.txHash : undefined,
        };
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          alreadyCompleted: false,
          error: e instanceof Error ? e.message : "panic_reward_error",
        };
      }
    },
  );

const redeemPointsSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  points: z.number().int().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
});

/** SIWE-gated Culture Points → BCC redemption (treasury transfer). */
export const postRedeemPointsForBcc = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => redeemPointsSchema.parse(raw))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      balance: number;
      bccWei?: string;
      txHash?: string;
      redemptionId?: string;
      alreadyRedeemed?: boolean;
      error?: string;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { verifySiweSignature } = await import("@bc/identity/server");
      const { redeemPointsForBcc } = await import("@/server/points/redeem");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, error: "no_database" };
      }
      try {
        const address = await verifySiweSignature(data.message, data.signature);
        return redeemPointsForBcc(prisma, {
          address,
          points: data.points,
          idempotencyKey: data.idempotencyKey,
        });
      } catch (e) {
        return {
          ok: false,
          balance: 0,
          error: e instanceof Error ? e.message : "redeem_error",
        };
      }
    },
  );
