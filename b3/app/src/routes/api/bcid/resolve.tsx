import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcid/resolve")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const did = url.searchParams.get("did");
        const handle = url.searchParams.get("handle");

        if (!did && !handle) {
          return Response.json({ ok: false, error: "did_or_handle_required" }, { status: 400 });
        }

        const { findBcidByDid, findBcidByHandle } = await import("@/server/bcid/identity");
        const identity = did ? await findBcidByDid(did) : await findBcidByHandle(handle!);

        if (!identity) {
          return Response.json({ ok: false, error: "bcid_not_found" }, { status: 404 });
        }

        return Response.json({
          ok: true,
          did: identity.did,
          type: identity.type,
          ownerAddress: identity.ownerAddress,
          publicHandle: identity.publicHandle,
          tokenId: identity.tokenId,
          chainId: identity.chainId,
          displayName: identity.displayName,
          bridgedCultureHandle: identity.bridgeLink?.cultureHandle ?? null,
          createdAt: identity.mintedAt?.toISOString() ?? identity.createdAt.toISOString(),
        });
      },
    },
  },
  component: () => null,
});
