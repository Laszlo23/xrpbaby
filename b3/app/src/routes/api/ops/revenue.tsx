import { createFileRoute } from "@tanstack/react-router";

import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";
import { isX402Configured } from "@/server/x402-settle";

export const Route = createFileRoute("/api/ops/revenue")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();

        const stripeOk = Boolean(
          process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_WEBHOOK_SECRET?.trim(),
        );
        const x402Ok = isX402Configured();
        const resendOk = Boolean(process.env.RESEND_API_KEY?.trim());

        let outreach = { targets: 0, drafts: 0, sent: 0 };
        if (prisma) {
          const [targets, drafts, sent] = await Promise.all([
            prisma.outreachTarget.count(),
            prisma.outreachTouch.count({ where: { status: "draft" } }),
            prisma.outreachTouch.count({ where: { status: "sent" } }),
          ]);
          outreach = { targets, drafts, sent };
        }

        let packPurchases = 0;
        if (prisma) {
          try {
            packPurchases = await prisma.packPurchase.count();
          } catch {
            packPurchases = 0;
          }
        }

        let agentRuns = 0;
        if (prisma) {
          try {
            agentRuns = await prisma.agentActionLog.count({
              where: {
                status: "ok",
                action: { in: ["agent.research_query", "agent.grant_brief"] },
              },
            });
          } catch {
            agentRuns = 0;
          }
        }

        return json({
          ok: true,
          generatedAt: new Date().toISOString(),
          lanes: {
            stripe: { configured: stripeOk, packPurchases },
            x402: { configured: x402Ok, researchPrice: process.env.X402_RESEARCH_PRICE ?? "$0.05" },
            outreach: { resendConfigured: resendOk, ...outreach },
            agents: { successfulRuns: agentRuns },
          },
          grantProof: `${process.env.PUBLIC_APP_ORIGIN ?? "https://app.buildingcultureid.space"}/grant-proof`,
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
}
