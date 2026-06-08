import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildXrpQuote } from "@/server/xrp/quote-service";

const querySchema = z.object({
  base: z.string().min(1).max(16),
  quote: z.string().min(1).max(16),
  amount: z.coerce.number().positive(),
  mode: z.enum(["learn", "live"]).default("learn"),
});

export const Route = createFileRoute("/api/market/xrp-quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          base: url.searchParams.get("base") ?? "XRP",
          quote: url.searchParams.get("quote") ?? "USD",
          amount: url.searchParams.get("amount") ?? "1",
          mode: url.searchParams.get("mode") ?? "learn",
        });
        if (!parsed.success) return json({ ok: false, error: "invalid_query" }, 400);

        const result = buildXrpQuote(parsed.data);
        if (!result.ok) return json(result, result.status);
        return json(result);
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=20",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
