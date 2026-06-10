import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requireFeedbackAdmin } from "@/server/feedback/auth";
import { reviewProductFeedback } from "@/server/feedback/review";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  feedbackId: z.string().min(1).max(64),
  status: z.enum(["useful", "gold", "implemented", "pending_review"]),
  publicTitle: z.string().max(200).optional(),
  showOnWall: z.boolean().optional(),
  reviewedBy: z.string().max(120).optional(),
});

export const Route = createFileRoute("/api/feedback/review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!requireFeedbackAdmin(request)) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        const limited = checkRateLimit(request, "feedback-review", 120);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request, 8192);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const result = await reviewProductFeedback(prisma, {
          feedbackId: parsed.data.feedbackId,
          status: parsed.data.status,
          reviewedBy: parsed.data.reviewedBy ?? "admin",
          publicTitle: parsed.data.publicTitle,
          showOnWall: parsed.data.showOnWall,
        });

        if (!result.ok) return json({ ok: false, error: result.error }, 404);

        return json({
          ok: true,
          feedbackId: result.feedback.id,
          status: result.feedback.status,
          pointsGranted: result.feedback.pointsGranted,
          bonusPoints: result.bonusPoints,
          showOnWall: result.feedback.showOnWall,
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
