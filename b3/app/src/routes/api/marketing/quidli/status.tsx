import { createFileRoute } from "@tanstack/react-router";

import { buildQuidliStatus } from "@/server/quidli/status";

export const Route = createFileRoute("/api/marketing/quidli/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proto =
          request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
          url.protocol.replace(":", "");
        const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? url.host;
        const origin = `${proto}://${host}`;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        const payload = await buildQuidliStatus(prisma, origin);
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=30",
          },
        });
      },
    },
  },
});
