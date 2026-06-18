import { createFileRoute } from "@tanstack/react-router";

import { handleGrantAgentPost } from "@/server/agents/grant";

export const Route = createFileRoute("/api/agents/grant")({
  server: {
    handlers: {
      POST: ({ request }) => handleGrantAgentPost(request),
    },
  },
  component: () => null,
});
