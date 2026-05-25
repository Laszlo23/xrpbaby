import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireSiweAuth } from "@/server/platform/siwe";

const postSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(10),
  signature: z.string().min(10),
  body: z.string().min(1).max(2000),
});

export const Route = createFileRoute("/api/pulse/feed/$id/comments")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const comments = await prisma.socialComment.findMany({
          where: { feedItemId: params.id, hidden: false },
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            member: {
              select: {
                displayName: true,
                walletAddress: true,
                forestStage: true,
              },
            },
          },
        });

        return json({
          ok: true,
          comments: comments.map((c) => ({
            id: c.id,
            body: c.body,
            createdAt: c.createdAt,
            member: c.member,
          })),
        });
      },
      POST: async ({ request, params }) => {
        const limited = checkRateLimit(request, "pulse-comment", 30);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request, 8192);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = postSchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        const feed = await prisma.socialFeedItem.findUnique({
          where: { id: params.id },
        });
        if (!feed) return json({ ok: false, error: "not_found" }, 404);

        const { ensureWalletAndMember } = await import("@/server/platform/member");
        const { member } = await ensureWalletAndMember(prisma, auth.address);

        const comment = await prisma.socialComment.create({
          data: {
            feedItemId: params.id,
            memberId: member.id,
            body: parsed.data.body.trim(),
          },
        });

        return json({ ok: true, commentId: comment.id });
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
