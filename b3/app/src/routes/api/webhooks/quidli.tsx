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
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proto =
          request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
          url.protocol.replace(":", "");
        const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? url.host;
        const origin = `${proto}://${host}`;

        const { buildQuidliStatus } = await import("@/server/quidli/status");
        const { getPrisma } = await import("@/server/db/prisma");
        const status = await buildQuidliStatus(getPrisma(), origin);
        return json({
          ...status,
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
