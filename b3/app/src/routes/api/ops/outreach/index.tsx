import { createFileRoute } from "@tanstack/react-router";

import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";

export const Route = createFileRoute("/api/ops/outreach/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const { listOutreachBoard } = await import("@/server/outreach/crm");
        const data = await listOutreachBoard(prisma);
        return json(data);
      },
      POST: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const { validateTargetInput } = await import("@/server/outreach/crm");
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const validated = validateTargetInput(body);
        if (!validated.ok) {
          return json({ ok: false, error: validated.error }, 400);
        }

        const target = await prisma.outreachTarget.create({
          data: {
            name: validated.data.name,
            segment: validated.data.segment,
            channel: validated.data.channel,
            contactEmail: validated.data.contactEmail,
            contactUrl: validated.data.contactUrl,
            notes: validated.data.notes,
            grantProofUrl:
              validated.data.grantProofUrl ?? "https://app.buildingcultureid.space/grant-proof",
          },
        });

        return json({ ok: true, target });
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
