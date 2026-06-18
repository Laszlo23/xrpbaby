import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/credentials/member")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim();
        const handle = url.searchParams.get("handle")?.trim();
        if (!address && !handle) {
          return Response.json({ ok: false, error: "address_or_handle_required" }, { status: 400 });
        }
        const { getMemberCredentialState } = await import("@/server/credentials/claim");
        const state = await getMemberCredentialState({
          handle: handle ?? undefined,
          walletAddress: address ?? undefined,
        });
        return Response.json({ ok: true, ...state });
      },
    },
  },
  component: () => null,
});
