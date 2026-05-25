import { createServerFn } from "@tanstack/react-start";
import type { Address, Hex } from "viem";
import { z } from "zod";

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
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, reason: "no_database", balance: 0, completedSlugs: [] };
      }
      const addr = data.address.toLowerCase();
      const wallet = await prisma.wallet.findUnique({ where: { address: addr } });
      if (!wallet) {
        return { ok: true, balance: 0, completedSlugs: [] };
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
      return { ok: true, balance: agg._sum.delta ?? 0, completedSlugs };
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
      const { getPrisma } = await import("@/server/db/prisma");
      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, reason: "no_database", rows: [] };
      }
      const { Prisma } = await import("@prisma/client");
      const limit = data.limit ?? 50;
      const rows = await prisma.$queryRaw<{ address: string; points: number }[]>(Prisma.sql`
        SELECT w.address, COALESCE(SUM(pl.delta), 0)::int AS points
        FROM "Wallet" w
        INNER JOIN "PointLedger" pl ON pl."walletId" = w.id
        GROUP BY w.id, w.address
        ORDER BY points DESC
        LIMIT ${limit}
      `);
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
      const { getPrisma } = await import("@/server/db/prisma");
      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, reason: "no_database", rows: [] };
      }
      const { Prisma } = await import("@prisma/client");
      const limit = data.limit ?? 12;
      const rows = await prisma.$queryRaw<{ address: string; points: number }[]>(Prisma.sql`
        SELECT w.address, COALESCE(SUM(pl.delta), 0)::int AS points
        FROM "Wallet" w
        INNER JOIN "PointLedger" pl ON pl."walletId" = w.id
        WHERE pl."taskSlug" = 'raffle-referral-bonus'
          AND pl."createdAt" > NOW() - INTERVAL '30 days'
        GROUP BY w.id, w.address
        ORDER BY points DESC
        LIMIT ${limit}
      `);
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
  proofUrl: z.string().url(),
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

const dailyChainSchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chainId: z.number().int(),
});

/** Awards points once per UTC day after verifying a successful DailyCheckIn tx on Base. */
export const postCompleteDailyChainCheckIn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => dailyChainSchema.parse(raw))
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
      const { verifyDailyCheckInTx } = await import("@bc/proof");

      const prisma = getPrisma();
      if (!prisma) {
        return { ok: false, balance: 0, alreadyCompleted: false, error: "no_database" };
      }

      try {
        const address = await verifySiweSignature(data.message, data.signature);
        const proof = await verifyDailyCheckInTx({
          txHash: data.txHash as Hex,
          expectedWallet: address as Address,
          chainId: data.chainId,
          getEnv: () => {
            const e: Record<string, string | undefined> = {};
            if (typeof import.meta !== "undefined" && import.meta.env) {
              Object.assign(e, import.meta.env as Record<string, string | undefined>);
            }
            if (typeof process !== "undefined" && process.env) {
              Object.assign(e, process.env as Record<string, string | undefined>);
            }
            return e;
          },
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

        await ensureDefaultTasks(prisma);

        const task = await prisma.taskDefinition.findUnique({
          where: { slug: "daily-checkin-onchain" },
        });
        if (!task || !task.active) {
          return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
        }

        const addr = address.toLowerCase();
        const { wallet } = await ensureWalletAndMember(prisma, addr);

        const dayUTC = new Date().toISOString().slice(0, 10);
        const prior = await prisma.pointLedger.findMany({
          where: { walletId: wallet.id, taskSlug: "daily-checkin-onchain" },
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

        const metadata = {
          kind: "daily_chain" as const,
          dayUTC,
          txHash: data.txHash.toLowerCase(),
          dayIndex: proof.dayIndex.toString(),
        };

        if (task.points > 0) {
          await prisma.pointLedger.create({
            data: {
              walletId: wallet.id,
              delta: task.points,
              reason: "task_completion",
              taskSlug: "daily-checkin-onchain",
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
          error: e instanceof Error ? e.message : "daily_error",
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
