import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/investors/treasury-balances")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getInvestorTreasuryBalances } = await import(
            "@/server/investors/treasury-balances"
          );
          const data = await getInvestorTreasuryBalances();
          return json(data);
        } catch (e) {
          const message = e instanceof Error ? e.message : "treasury_balances_unavailable";
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
      "Cache-Control": "public, max-age=60",
    },
  });
}
