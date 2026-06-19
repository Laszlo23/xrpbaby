import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { fetchMemoryTimeline } from "@/server/memory/timeline";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const Route = createFileRoute("/api/memory/timeline")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          address: url.searchParams.get("address"),
          limit: url.searchParams.get("limit") ?? undefined,
        });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_query" }, 400);
        }

        const events = await fetchMemoryTimeline(
          parsed.data.address.toLowerCase(),
          parsed.data.limit ?? 50,
        );

        return json({ ok: true, events });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=15" },
  });
}
