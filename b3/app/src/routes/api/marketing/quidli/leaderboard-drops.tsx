import { createFileRoute } from "@tanstack/react-router";

import { groveMarketingAdminSecret } from "@/server/marketing/grove/env";
import { runQuidliLeaderboardDrops } from "@/server/quidli/leaderboard-drops";

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

export const Route = createFileRoute("/api/marketing/quidli/leaderboard-drops")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = groveMarketingAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-grove-marketing-admin-secret") ||
          request.headers.get("x-x-marketing-admin-secret");
        if (hdr !== expected) return unauthorized();

        let body: Record<string, unknown> = {};
        try {
          const raw = await request.text();
          if (raw.trim()) body = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const dryRun = body.dryRun === true;
        const limit = typeof body.limit === "number" ? body.limit : Number(body.limit) || 3;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const result = await runQuidliLeaderboardDrops(prisma, { limit, dryRun });
        return json(result);
      },
    },
  },
});
