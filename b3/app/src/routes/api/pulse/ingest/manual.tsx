import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { pulseAdminSecret } from "@/server/pulse/config";
import { createNativeFeedItem } from "@/server/pulse/ingest";
import { readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  url: z.string().url().optional(),
  content: z.string().min(1).max(4000),
  authorName: z.string().max(200).optional(),
});

export const Route = createFileRoute("/api/pulse/ingest/manual")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = pulseAdminSecret();
        const header = request.headers.get("x-pulse-admin-secret");
        if (!secret || header !== secret) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const id = await createNativeFeedItem(prisma, {
          content: parsed.data.content,
          permalink: parsed.data.url,
          authorName: parsed.data.authorName,
          externalId: parsed.data.url
            ? `url-${Buffer.from(parsed.data.url).toString("base64url").slice(0, 48)}`
            : undefined,
        });

        return json({ ok: true, id });
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
