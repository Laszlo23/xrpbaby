import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  campaignSlug: z.string().min(1).max(64),
});

export const Route = createFileRoute("/api/airdrop/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const { requireSiweAuthFromMessage } = await import("@/server/platform/siwe");
        const auth = await requireSiweAuthFromMessage(parsed.data.message, parsed.data.signature);
        if ("error" in auth) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        const addr = auth.address.toLowerCase();
        const wallet = await prisma.wallet.findUnique({ where: { address: addr } });
        if (!wallet) return json({ ok: false, error: "no_allocation" }, 404);

        const campaign = await prisma.airdropCampaign.findUnique({
          where: { slug: parsed.data.campaignSlug },
        });
        if (!campaign || campaign.status !== "claimable") {
          return json({ ok: false, error: "campaign_not_claimable" }, 400);
        }

        const allocation = await prisma.airdropAllocation.findFirst({
          where: { campaignId: campaign.id, walletId: wallet.id },
        });
        if (!allocation?.amountWei) {
          return json({ ok: false, error: "no_allocation" }, 404);
        }

        const claimKey = `airdrop:${campaign.id}:${wallet.id}`;
        const prior = await prisma.pointRedemption.findUnique({
          where: { idempotencyKey: claimKey },
        });
        if (prior?.status === "credited") {
          return json({
            ok: true,
            alreadyClaimed: true,
            txHash: prior.txHash,
            bccWei: prior.bccWei,
          });
        }

        const amountWei = BigInt(allocation.amountWei);
        const { trySendBccFromTreasury } = await import("@/server/wallet/bcc-treasury-transfer");

        const redemption =
          prior ??
          (await prisma.pointRedemption.create({
            data: {
              walletId: wallet.id,
              pointsSpent: allocation.pointsSnapshot ?? 0,
              bccWei: allocation.amountWei,
              status: "pending",
              idempotencyKey: claimKey,
            },
          }));

        const payout = await trySendBccFromTreasury({
          to: addr as `0x${string}`,
          amountWei,
          memo: `airdrop_claim:${campaign.slug}`,
        });

        if (!payout.ok) {
          await prisma.pointRedemption.update({
            where: { id: redemption.id },
            data: { status: "failed" },
          });
          return json({ ok: false, error: payout.error }, 500);
        }

        await prisma.pointRedemption.update({
          where: { id: redemption.id },
          data: {
            status: "credited",
            txHash: payout.txHash,
            creditedAt: new Date(),
          },
        });

        return json({
          ok: true,
          txHash: payout.txHash,
          bccWei: allocation.amountWei,
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
