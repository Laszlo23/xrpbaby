import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/pulse/attestation/latest")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const att = await prisma.pulseAttestation.findFirst({
          orderBy: { createdAt: "desc" },
        });
        if (!att) {
          return json({ ok: true, attestation: null });
        }

        const explorer =
          att.chainId === 84532
            ? "https://sepolia.basescan.org"
            : "https://basescan.org";

        return json({
          ok: true,
          attestation: {
            dayId: att.dayId,
            digest: att.digest,
            metadataUri: att.metadataUri,
            chainId: att.chainId,
            txHash: att.txHash,
            blockNumber: att.blockNumber,
            createdAt: att.createdAt,
            explorerUrl: `${explorer}/tx/${att.txHash}`,
          },
        });
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
