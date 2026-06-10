import { createFileRoute } from "@tanstack/react-router";

import { resolveFeedbackAuthByAddress } from "@/server/feedback/auth";

export const Route = createFileRoute("/api/feedback/mine")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const url = new URL(request.url);
        const address = url.searchParams.get("address") ?? undefined;
        const auth = await resolveFeedbackAuthByAddress(prisma, request, address);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const rows = await prisma.productFeedback.findMany({
          where: { memberId: auth.memberId },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            area: true,
            status: true,
            qualityScore: true,
            pointsGranted: true,
            rejectReason: true,
            publicTitle: true,
            showOnWall: true,
            createdAt: true,
            reviewedAt: true,
          },
        });

        return json({ ok: true, submissions: rows });
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
