import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/agents/status")({
  server: {
    handlers: {
      GET: async () => {
        const { getAgentFleetDashboard } = await import("@/server/agents/dashboard");
        const data = await getAgentFleetDashboard();
        if (!data) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "database_unconfigured",
              agentsPaused: false,
              econLive: false,
              recentLogs: [],
              agsMonthlyOkCount: 0,
              eliasConciergeLedger24h: 0,
            }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(JSON.stringify({ ok: true, ...data }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
  component: StatusNote,
});

function StatusNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">GET /api/agents/status</p>
      <p>JSON snapshot for agent fleet kill-switch and recent ledger rows.</p>
    </div>
  );
}
