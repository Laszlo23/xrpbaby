import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcid/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 100);

        const { fetchBcidLeaderboard } = await import("@/server/reputation/bcid-leaderboard");
        const entries = await fetchBcidLeaderboard(limit);

        return Response.json({ ok: true, entries });
      },
    },
  },
  component: () => null,
});
