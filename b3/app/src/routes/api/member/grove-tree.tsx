import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/member/grove-tree")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim();
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const { getCultureGroveTree, getMemberIdByWallet } =
          await import("@/server/culture-grove/grove");
        const memberId = await getMemberIdByWallet(prisma, address);
        if (!memberId) {
          return json({ ok: false, error: "member_not_found" }, 404);
        }

        const tree = await getCultureGroveTree(prisma, memberId);
        if (!tree) {
          return json({ ok: false, error: "member_not_found" }, 404);
        }

        return json(tree);
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
