import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  points: z.coerce.number().int().positive().max(1_000_000),
});

export const Route = createFileRoute("/api/points/redeem/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          address: url.searchParams.get("address"),
          points: url.searchParams.get("points") ?? "1",
        });
        if (!parsed.success) return json({ ok: false, error: "invalid_query" }, 400);

        const { quotePointsRedeem } = await import("@/server/points/redeem");
        const quote = await quotePointsRedeem(prisma, parsed.data.address, parsed.data.points);
        return json(quote);
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
