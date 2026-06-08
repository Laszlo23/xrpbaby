import { createFileRoute } from "@tanstack/react-router";
import { handleQuidliWebhook } from "@/server/quidli/handle-webhook";
import { quidliApiKey } from "@/server/quidli/env";

export const Route = createFileRoute("/api/webhooks/quidli")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = quidliApiKey();
        if (!apiKey) {
          return json({ ok: false, error: "quidli_not_configured" }, 503);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        const result = await handleQuidliWebhook(request, prisma, apiKey);

        if (!result.ok) {
          return json({ ok: false, error: result.error }, result.status);
        }
        return json({ ok: true, stored: result.stored });
      },
      GET: async () => {
        const configured = Boolean(quidliApiKey());
        return json({
          ok: true,
          service: "quidli-connect",
          configured,
          docs: "https://docs.quid.li/",
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
