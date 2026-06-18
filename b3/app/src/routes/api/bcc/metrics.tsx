import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcc/metrics")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { fetchBccMetrics } = await import("@/server/bcc/metrics");
          const data = await fetchBccMetrics();
          return json(data);
        } catch (e) {
          const message = e instanceof Error ? e.message : "bcc_metrics_unavailable";
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
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}
