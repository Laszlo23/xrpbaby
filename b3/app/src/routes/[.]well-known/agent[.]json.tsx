import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/agent.json")({
  server: {
    handlers: {
      GET: async () => {
        const { buildBuildchainAgentCard } = await import("@/server/buildchain-agent-card");
        const body = buildBuildchainAgentCard();
        return new Response(JSON.stringify(body, null, 2), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
  component: () => null,
});
