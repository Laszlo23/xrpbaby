import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember, progressionFromPoints, getCulturePoints } from "@/server/tg/member";

const bodySchema = z.object({
  moduleId: z.string().min(1).max(128),
  proof: z
    .object({
      quizScore: z.coerce.number().min(0).max(100).optional(),
      gratitudeType: z.enum(["support", "educate", "create"]).optional(),
      gratitudeNote: z.string().min(1).max(280).optional(),
    })
    .optional(),
});

const MODULE_XP: Record<string, number> = {
  m_xrp_liquidity_basics: 30,
  m_ton_wallet_safety: 30,
  m_gratitude_support_loop: 25,
};

export const Route = createFileRoute("/api/tg/learn/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-learn-complete", 60);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const raw = await readJsonBody(request, 8192);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const moduleId = parsed.data.moduleId;
        const xpReward = MODULE_XP[moduleId];
        if (!xpReward) return json({ ok: false, error: "unknown_module" }, 404);
        if (moduleId === "m_gratitude_support_loop") {
          const gratitudeNote = parsed.data.proof?.gratitudeNote?.trim() ?? "";
          if (gratitudeNote.length < 12) {
            return json({ ok: false, error: "gratitude_note_too_short" }, 400);
          }
        }
        if ((parsed.data.proof?.quizScore ?? 100) < 70) {
          return json({ ok: false, error: "proof_threshold_not_met" }, 400);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });
        if (!member.walletId) return json({ ok: false, error: "wallet_not_linked" }, 409);

        const existing = await prisma.activityEvent.findFirst({
          where: {
            memberId: member.id,
            type: "tg:learn_completed",
            payload: { path: ["moduleId"], equals: moduleId },
          },
          select: { id: true },
        });
        if (existing) {
          const points = await getCulturePoints(prisma, member.walletId);
          return json({
            ok: true,
            idempotent: true,
            xpGranted: 0,
            progression: progressionFromPoints(points),
            nextRecommendedModuleId:
              moduleId === "m_xrp_liquidity_basics" ? "m_ton_wallet_safety" : null,
          });
        }

        await prisma.pointLedger.create({
          data: {
            walletId: member.walletId,
            delta: xpReward,
            reason: "tg_learning_reward",
            taskSlug: moduleId,
            metadata: { moduleId, source: "telegram" },
          },
        });
        await prisma.activityEvent.create({
          data: {
            memberId: member.id,
            type: "tg:learn_completed",
            sourceModule: "telegram",
            payload: {
              moduleId,
              xpReward,
              quizScore: parsed.data.proof?.quizScore ?? null,
              gratitudeType: parsed.data.proof?.gratitudeType ?? null,
              gratitudeNote: parsed.data.proof?.gratitudeNote ?? null,
            },
          },
        });
        if (moduleId === "m_gratitude_support_loop") {
          await prisma.activityEvent.create({
            data: {
              memberId: member.id,
              type: "tg:gratitude_sent",
              sourceModule: "telegram",
              payload: {
                gratitudeType: parsed.data.proof?.gratitudeType ?? "support",
                gratitudeNote: parsed.data.proof?.gratitudeNote ?? null,
              },
            },
          });
        }

        const points = await getCulturePoints(prisma, member.walletId);
        return json({
          ok: true,
          xpGranted: xpReward,
          progression: progressionFromPoints(points),
          nextRecommendedModuleId:
            moduleId === "m_xrp_liquidity_basics"
              ? "m_ton_wallet_safety"
              : moduleId === "m_ton_wallet_safety"
                ? "m_gratitude_support_loop"
                : null,
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
