import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/identity/team-wallet")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          address: url.searchParams.get("address"),
        });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const { isIdentityTeamWallet } = await import("@/lib/identity/handle-policy");
        return json({
          ok: true,
          teamMintWallet: isIdentityTeamWallet(parsed.data.address),
        });
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
      "Cache-Control": "private, max-age=60",
    },
  });
}
