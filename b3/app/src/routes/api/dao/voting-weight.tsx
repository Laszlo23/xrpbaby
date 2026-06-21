import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/dao/voting-weight")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const address = url.searchParams.get("address")?.trim() ?? "";
          const { computeDaoVotingWeight } = await import("@/server/dao/voting-weight");
          const quote = await computeDaoVotingWeight(address);
          return new Response(JSON.stringify(quote), {
            status: quote.ok || quote.error === "invalid_address" ? 200 : 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=60",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "voting_weight_unavailable";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      },
    },
  },
  component: () => null,
});
