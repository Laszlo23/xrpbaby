import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/investors/xrpl-intake")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = Math.min(Number(url.searchParams.get("limit") ?? "10"), 25);
          const { getXrplIntakeStatus } = await import("@/server/xrp/treasury-intake");
          const data = await getXrplIntakeStatus(limit);
          return json(data);
        } catch (e) {
          const message = e instanceof Error ? e.message : "xrpl_intake_unavailable";
          return json({ ok: false, error: message }, 503);
        }
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
      "Cache-Control": "public, max-age=30",
    },
  });
}
