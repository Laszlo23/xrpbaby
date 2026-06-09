import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/investors/traction")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }
        const { getInvestorTraction } = await import("@/server/investors/traction");
        const traction = await getInvestorTraction(prisma);
        return json({ ok: true, traction });
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
