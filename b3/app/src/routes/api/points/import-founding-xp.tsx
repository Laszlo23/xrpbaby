import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readJsonBody } from "@/server/platform/rate-limit";
import { requirePlatformInternalSecret } from "@/server/platform/admin-secret";
import { ensureWalletAndMember } from "@/server/platform/member";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  foundingXp: z.number().int().min(0).max(10_000_000),
  foundingUserId: z.string().min(1).max(128),
  campaignSlug: z.string().min(1).max(64).default("founding-xp-v1"),
});

/** 1 founding XP → 1 Culture Point (documented in SMART_WALLET_AND_PACKS.md). */
const FOUNDING_XP_TO_POINTS_RATIO = 1;

export const Route = createFileRoute("/api/points/import-founding-xp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = requirePlatformInternalSecret(request);
        if (!gate.ok) {
          return json({ ok: false, error: gate.error }, gate.status);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const addr = parsed.data.walletAddress.toLowerCase();
        const idempotencyKey = `founding:${parsed.data.campaignSlug}:${parsed.data.foundingUserId}`;
        const pointsToGrant = Math.floor(parsed.data.foundingXp * FOUNDING_XP_TO_POINTS_RATIO);

        const { wallet } = await ensureWalletAndMember(prisma, addr);

        const priorRows = await prisma.pointLedger.findMany({
          where: { walletId: wallet.id, reason: "founding_xp_import" },
          select: { metadata: true },
        });
        const already = priorRows.some((row) => {
          const m = row.metadata as { idempotencyKey?: string } | null;
          return m?.idempotencyKey === idempotencyKey;
        });
        if (already) {
          const agg = await prisma.pointLedger.aggregate({
            where: { walletId: wallet.id },
            _sum: { delta: true },
          });
          return json({
            ok: true,
            alreadyImported: true,
            pointsGranted: 0,
            balance: agg._sum.delta ?? 0,
          });
        }

        if (pointsToGrant <= 0) {
          return json({ ok: true, pointsGranted: 0, balance: 0 });
        }

        await prisma.pointLedger.create({
          data: {
            walletId: wallet.id,
            delta: pointsToGrant,
            reason: "founding_xp_import",
            metadata: {
              idempotencyKey,
              foundingUserId: parsed.data.foundingUserId,
              foundingXp: parsed.data.foundingXp,
              campaignSlug: parsed.data.campaignSlug,
            },
          },
        });

        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });

        return json({
          ok: true,
          pointsGranted: pointsToGrant,
          balance: agg._sum.delta ?? 0,
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
