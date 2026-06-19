import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/identity/referral/codes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet")?.trim() ?? "";

        if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
          return Response.json({ ok: false, error: "invalid_wallet" }, { status: 400 });
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
        }

        const { listReferralCodesForWallet } = await import("@/server/identity/referral-codes");
        const data = await listReferralCodesForWallet(prisma, wallet);

        return Response.json({ ok: true, ...data });
      },
    },
  },
  component: () => null,
});
