import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/pulse/digest/$dayId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const { buildDailyDigestPayload } = await import("@/server/pulse/ingest");
        const { digestHex } = await import("@/server/pulse/digest");

        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const dayId = params.dayId;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dayId)) {
          return json({ ok: false, error: "invalid_day" }, 400);
        }

        const payload = await buildDailyDigestPayload(prisma, dayId);
        const digest = digestHex(payload);

        const att = await prisma.pulseAttestation.findUnique({
          where: { dayId },
        });

        return json(
          {
            dayId,
            digest,
            payload,
            onChain: att
              ? { txHash: att.txHash, chainId: att.chainId, metadataUri: att.metadataUri }
              : null,
          },
          200,
          {
            "Cache-Control": "public, max-age=300",
          },
        );
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}
