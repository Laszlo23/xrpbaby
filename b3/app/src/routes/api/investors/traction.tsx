import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/investors/traction")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }
        const view = new URL(request.url).searchParams.get("view");
        if (view === "proof") {
          const { getPublicProofStats } = await import("@/server/public/proof");
          const proof = await getPublicProofStats(prisma);
          return json({ ok: true, proof });
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
