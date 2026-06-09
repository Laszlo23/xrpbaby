import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { parseIngestAuth, verifyIngestKey } from "@/server/growth-intelligence/auth";
import { ingestGrowthEvents } from "@/server/growth-intelligence/ingest";
import { ensureGrowthApps, resolveAppBySlug } from "@/server/growth-intelligence/seed";

const eventSchema = z.object({
  kind: z.string().min(1).max(64),
  pathname: z.string().min(1).max(512),
  selector: z.string().max(512).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  scrollDepth: z.number().optional(),
  viewportW: z.number().optional(),
  viewportH: z.number().optional(),
  meta: z.record(z.unknown()).optional(),
  ts: z.number().optional(),
});

const bodySchema = z.object({
  sessionId: z.string().min(8).max(128),
  events: z.array(eventSchema).min(1).max(100),
  walletAddress: z.string().max(128).optional(),
  memberId: z.string().max(128).optional(),
});

export const Route = createFileRoute("/api/intelligence/ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "gi-ingest", 300);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const { appSlug, apiKey } = parseIngestAuth(request);
        if (!appSlug || !verifyIngestKey(appSlug, apiKey)) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        const raw = await readJsonBody(request, 65536);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "db_unavailable" }, 503);
        }

        await ensureGrowthApps(prisma);
        const app = await resolveAppBySlug(prisma, appSlug);
        if (!app) {
          return json({ ok: false, error: "unknown_app" }, 404);
        }

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined;

        const result = await ingestGrowthEvents(prisma, app.id, parsed.data, {
          userAgent: request.headers.get("user-agent") ?? undefined,
          ip,
        });

        return json({ ok: true, accepted: result.accepted });
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
