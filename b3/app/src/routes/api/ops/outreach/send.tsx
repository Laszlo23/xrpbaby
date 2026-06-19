import { createFileRoute } from "@tanstack/react-router";

import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";

export const Route = createFileRoute("/api/ops/outreach/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        let body: { touchId?: string; sentBy?: string };
        try {
          body = (await request.json()) as { touchId?: string; sentBy?: string };
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        if (!body.touchId?.trim()) {
          return json({ ok: false, error: "touch_id_required" }, 400);
        }

        const { approveAndSendTouch } = await import("@/server/outreach/crm");
        const result = await approveAndSendTouch(prisma, {
          touchId: body.touchId.trim(),
          sentBy: body.sentBy,
        });
        if (!result.ok) {
          return json({ ok: false, error: result.error }, result.status);
        }
        return json({ ok: true, resendId: result.resendId });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}
