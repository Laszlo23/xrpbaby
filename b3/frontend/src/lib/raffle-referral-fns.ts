import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicClient, decodeEventLog, http, type Address, type Hex } from "viem";
import { base } from "viem/chains";
import { raffleCampaignAbi, resolveRaffleCampaignAddress } from "@bc/contracts-sdk";

const inputSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  referrer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  buyer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const MAX_POINTS_PER_TX = 150;

/**
 * Credits referrer points after a verified raffle `Minted` tx on Base.
 * Trust model: `buyer` must match on-chain `Minted.to` for logs from the campaign contract.
 */
export const postCreditRaffleReferralMint = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => inputSchema.parse(raw ?? {}))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      reason?: string;
      credited?: number;
    }> => {
      const { getPrisma } = await import("@/server/db/prisma");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");

      const prisma = getPrisma();
      if (!prisma) return { ok: false, reason: "no_database" };

      const envLike = { ...process.env } as Record<string, string | undefined>;
      const campaign = resolveRaffleCampaignAddress(8453, envLike);
      if (!campaign) return { ok: false, reason: "no_campaign" };

      const rpc =
        process.env.BASE_RPC_URL?.trim() ||
        process.env.VITE_BASE_RPC_URL?.trim() ||
        "https://mainnet.base.org";

      const client = createPublicClient({ chain: base, transport: http(rpc) });
      const receipt = await client.getTransactionReceipt({ hash: data.txHash as Hex });
      if (!receipt || receipt.status !== "success") {
        return { ok: false, reason: "tx_failed_or_missing" };
      }

      const buyerLc = data.buyer.toLowerCase() as Address;
      const referrerLc = data.referrer.toLowerCase() as Address;
      if (referrerLc === buyerLc) return { ok: false, reason: "self_referral" };

      let mintCount = 0;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== campaign.toLowerCase()) continue;
        try {
          const ev = decodeEventLog({
            abi: raffleCampaignAbi,
            data: log.data,
            topics: log.topics,
            strict: false,
          });
          if (ev.eventName !== "Minted") continue;
          const to = (ev.args as { to?: Address }).to;
          if (!to || to.toLowerCase() !== buyerLc) {
            return { ok: false, reason: "buyer_mismatch" };
          }
          mintCount += 1;
        } catch {
          continue;
        }
      }

      if (mintCount === 0) return { ok: false, reason: "no_mint_logs" };

      await ensureDefaultTasks(prisma);
      const task = await prisma.taskDefinition.findUnique({
        where: { slug: "raffle-referral-bonus" },
      });
      if (!task || !task.active) return { ok: false, reason: "task_disabled" };

      let refWallet = await prisma.wallet.findUnique({ where: { address: referrerLc } });
      if (!refWallet) {
        refWallet = await prisma.wallet.create({ data: { address: referrerLc } });
      }

      const txKey = (data.txHash as string).toLowerCase();
      const reasonKey = `raffle_referral_${txKey}`;
      const existing = await prisma.pointLedger.findFirst({
        where: {
          walletId: refWallet.id,
          reason: reasonKey,
        },
      });
      if (existing) return { ok: true, credited: 0 };

      const per = task.points;
      const delta = Math.min(MAX_POINTS_PER_TX, per * mintCount);

      await prisma.pointLedger.create({
        data: {
          walletId: refWallet.id,
          delta,
          reason: reasonKey,
          taskSlug: "raffle-referral-bonus",
          metadata: {
            sourceTx: txKey,
            buyer: buyerLc,
            tickets: mintCount,
          } as object,
        },
      });

      return { ok: true, credited: delta };
    },
  );
