import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcid/by-culture")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const handle = url.searchParams.get("handle");
        if (!handle) {
          return Response.json({ ok: false, error: "handle_required" }, { status: 400 });
        }

        const { findBcidByCultureHandle } = await import("@/server/bcid/identity");
        const identity = await findBcidByCultureHandle(handle);

        if (!identity) {
          return Response.json({ ok: false, error: "no_bcid_for_culture" }, { status: 404 });
        }

        const scores = identity.reputationScores;

        return Response.json({
          ok: true,
          did: identity.did,
          publicHandle: identity.publicHandle,
          builder: scores?.builder ?? 0,
          trust: scores?.trust ?? 0,
          contribution: scores?.contribution ?? 0,
          verification: scores?.verification ?? 0,
          credentialCount: identity.credentials?.length ?? 0,
          bridgedCultureHandle: identity.bridgeLink?.cultureHandle ?? handle.toLowerCase(),
        });
      },
    },
  },
  component: () => null,
});
