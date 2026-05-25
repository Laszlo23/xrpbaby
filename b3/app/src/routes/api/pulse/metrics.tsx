import { createFileRoute } from "@tanstack/react-router";

import { pulseStreamFlags } from "@/server/pulse/config";

export const Route = createFileRoute("/api/pulse/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }
        const { getPulseMetrics } = await import("@/server/pulse/metrics");
        const snapshot = await getPulseMetrics(prisma);
        const streams = pulseStreamFlags();
        return json({
          ok: true,
          streams,
          snapshot: {
            capturedAt: snapshot.capturedAt,
            memberCount: snapshot.memberCount,
            waitlistCount: snapshot.waitlistCount,
            culturePoints: snapshot.culturePoints,
            activity24h: snapshot.activity24h,
            farcasterItems: snapshot.farcasterItems,
            xItems: snapshot.xItems,
            facebookItems: snapshot.facebookItems,
            tiktokItems: snapshot.tiktokItems,
            instagramItems: snapshot.instagramItems,
            nativeComments: snapshot.nativeComments,
            digest: snapshot.digest,
            live: snapshot.live,
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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}
