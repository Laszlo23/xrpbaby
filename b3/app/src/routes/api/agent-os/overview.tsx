import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/agent-os/overview")({
  server: {
    handlers: {
      GET: async () => {
        const { getAgentOsOverview } = await import("@/server/agents/overview");
        const data = await getAgentOsOverview();
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
          },
        });
      },
    },
  },
  component: OverviewApiNote,
});

function OverviewApiNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">GET /api/agent-os/overview</p>
      <p>Public Agent OS catalog, BCC ecosystem snapshot, and sanitized activity counts.</p>
    </div>
  );
}
