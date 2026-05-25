import { createFileRoute } from "@tanstack/react-router";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireSiweAuth } from "@/server/platform/siwe";
import { onboardingCompleteBodySchema } from "@/server/platform/schemas";

const bodySchema = onboardingCompleteBodySchema;

export const Route = createFileRoute("/api/platform/onboarding-complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "onboarding-complete", 20);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const raw = await readJsonBody(request);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        const {
          ensureWalletAndMember,
          grantWelcomeRewards,
          logActivity,
        } = await import("@/server/platform/member");
        const { wallet, member } = await ensureWalletAndMember(prisma, auth.address, {
          intent: parsed.data.intent,
          email: parsed.data.email,
        });
        await grantWelcomeRewards(prisma, member.id, wallet.id);
        await logActivity(prisma, {
          memberId: member.id,
          type: "onboarding_complete",
          sourceModule: "app",
          payload: { intent: parsed.data.intent },
        });
        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: wallet.id },
          _sum: { delta: true },
        });
        return json({
          ok: true,
          memberId: member.id,
          forestStage: member.forestStage,
          supporterTier: member.supporterTier,
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
