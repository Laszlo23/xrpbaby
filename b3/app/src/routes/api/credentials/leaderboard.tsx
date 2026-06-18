import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/credentials/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
        const { getReputationLeaderboard } = await import("@/server/reputation/leaderboard");
        const entries = await getReputationLeaderboard(limit);
        return Response.json({ ok: true, entries });
      },
    },
  },
  component: () => null,
});
