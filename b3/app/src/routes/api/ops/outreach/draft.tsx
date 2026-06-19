import { createFileRoute } from "@tanstack/react-router";

import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";

export const Route = createFileRoute("/api/ops/outreach/draft")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const { draftOutreachTouch } = await import("@/server/outreach/crm");
        const result = await draftOutreachTouch(
          prisma,
          body as { targetId: string; grantProofSummary?: string },
        );
        if (!result.ok) {
          return json({ ok: false, error: result.error }, result.status);
        }
        return json({ ok: true, touchId: result.touchId, draft: result.draft });
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
