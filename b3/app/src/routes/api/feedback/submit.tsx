import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { FEEDBACK_AREAS } from "@/server/feedback/constants";
import { resolveFeedbackAuth } from "@/server/feedback/auth";
import { submitProductFeedback } from "@/server/feedback/submit";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  message: z.string().min(1).max(2000).optional(),
  signature: z.string().min(1).max(2000).optional(),
  area: z.enum(FEEDBACK_AREAS),
  triedWhat: z.string().min(10).max(4000),
  problem: z.string().min(10).max(8000),
  suggestion: z.string().max(4000).optional(),
  evidenceUrl: z.union([z.string().url().max(500), z.literal("")]).optional(),
  pagePath: z.string().max(200).optional(),
});

export const Route = createFileRoute("/api/feedback/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "feedback-submit", 10);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request, 32_768);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const isTma = (request.headers.get("authorization") ?? "").toLowerCase().startsWith("tma ");
        if (
          !isTma &&
          (!parsed.data.address || !parsed.data.message || !parsed.data.signature)
        ) {
          return json({ ok: false, error: "siwe_required" }, 401);
        }
        const auth = await resolveFeedbackAuth(
          prisma,
          request,
          isTma
            ? undefined
            : {
                address: parsed.data.address ?? "",
                message: parsed.data.message ?? "",
                signature: parsed.data.signature ?? "",
              },
        );
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const result = await submitProductFeedback(prisma, {
          memberId: auth.memberId,
          walletId: auth.walletId,
          source: auth.source,
          area: parsed.data.area,
          triedWhat: parsed.data.triedWhat,
          problem: parsed.data.problem,
          suggestion: parsed.data.suggestion,
          evidenceUrl: parsed.data.evidenceUrl || undefined,
          pagePath: parsed.data.pagePath,
        });

        if (!result.ok) {
          return json({ ok: false, error: result.error, detail: result.detail }, 409);
        }

        return json({
          ok: true,
          feedbackId: result.feedbackId,
          status: result.status,
          qualityScore: result.qualityScore,
          pointsGranted: result.pointsGranted,
          rejectReason: result.rejectReason,
          coachingTips: result.coachingTips,
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
