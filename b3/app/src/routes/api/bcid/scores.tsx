import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcid/scores")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const did = url.searchParams.get("did");
        const handle = url.searchParams.get("handle");

        if (!did && !handle) {
          return Response.json({ ok: false, error: "did_or_handle_required" }, { status: 400 });
        }

        const { findBcidByDid, findBcidByHandle, recomputeBcidScores } = await import(
          "@/server/bcid/identity"
        );
        const identity = did ? await findBcidByDid(did) : await findBcidByHandle(handle!);

        if (!identity) {
          return Response.json({ ok: false, error: "bcid_not_found" }, { status: 404 });
        }

        const scores = identity.reputationScores ?? (await recomputeBcidScores(identity.id));

        return Response.json({
          ok: true,
          did: identity.did,
          builder: scores?.builder ?? 0,
          trust: scores?.trust ?? 0,
          contribution: scores?.contribution ?? 0,
          verification: scores?.verification ?? 0,
          updatedAt: identity.reputationScores?.updatedAt?.toISOString() ?? new Date().toISOString(),
        });
      },
    },
  },
  component: () => null,
});
