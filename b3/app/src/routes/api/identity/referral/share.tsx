import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
});

export const Route = createFileRoute("/api/identity/referral/share")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { requireSiweAuth } = await import("@/server/platform/siwe");
        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
        }

        const { recordReferralShare } = await import("@/server/identity/referral-codes");
        const result = await recordReferralShare(prisma, auth.address);

        return Response.json(result);
      },
    },
  },
  component: () => null,
});
