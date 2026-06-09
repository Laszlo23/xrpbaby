import { createFileRoute } from "@tanstack/react-router";

import { groveMarketingAdminSecret } from "@/server/marketing/grove/env";
import { executeQuidliSend } from "@/server/quidli/send";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function verifyAdmin(request: Request): boolean {
  const expected = groveMarketingAdminSecret();
  if (!expected) return false;
  const hdr =
    request.headers.get("x-grove-marketing-admin-secret") ||
    request.headers.get("x-x-marketing-admin-secret");
  return hdr === expected;
}

export const Route = createFileRoute("/api/marketing/quidli/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifyAdmin(request)) return unauthorized();

        let body: Record<string, unknown> = {};
        try {
          const raw = await request.text();
          if (raw.trim()) body = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const platform = typeof body.platform === "string" ? body.platform : "";
        const handle = typeof body.handle === "string" ? body.handle : "";
        if (!platform || !handle) {
          return json({ ok: false, error: "platform_and_handle_required" }, 400);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const result = await executeQuidliSend(prisma, {
          platform,
          handle,
          amountWei: typeof body.amountWei === "string" ? body.amountWei : undefined,
          memo: typeof body.memo === "string" ? body.memo : undefined,
          idempotencyKey:
            typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined,
          taskSlug: typeof body.taskSlug === "string" ? body.taskSlug : undefined,
          campaign: typeof body.campaign === "string" ? body.campaign : undefined,
          walletId: typeof body.walletId === "string" ? body.walletId : undefined,
          memberId: typeof body.memberId === "string" ? body.memberId : undefined,
          dryRun: body.dryRun === true,
        });

        return json(result, result.ok ? 200 : 400);
      },
    },
  },
});
