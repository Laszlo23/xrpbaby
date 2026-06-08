import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/platform/funnel-baseline")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const now = new Date();
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const funnelEvents = [
          "analytics:landing_view",
          "analytics:wallet_connected",
          "analytics:mint_clicked",
          "analytics:mint_confirmed",
        ] as const;
        const telegramEvents = [
          "tg:auth_success",
          "tg:ton_wallet_connected",
          "tg:quest_claimed",
          "tg:learn_completed",
          "tg:xrp_quote_requested",
        ] as const;

        const [events7, events30, tg7, tg30] = await Promise.all([
          prisma.activityEvent.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: {
              type: { in: [...funnelEvents] },
              createdAt: { gte: last7d },
            },
          }),
          prisma.activityEvent.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: {
              type: { in: [...funnelEvents] },
              createdAt: { gte: last30d },
            },
          }),
          prisma.activityEvent.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: {
              type: { in: [...telegramEvents] },
              createdAt: { gte: last7d },
            },
          }),
          prisma.activityEvent.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: {
              type: { in: [...telegramEvents] },
              createdAt: { gte: last30d },
            },
          }),
        ]);

        return json({
          ok: true,
          generatedAt: now.toISOString(),
          windows: {
            last7d: {
              funnel: toCountMap(events7),
              telegram: toCountMap(tg7),
            },
            last30d: {
              funnel: toCountMap(events30),
              telegram: toCountMap(tg30),
            },
          },
          notes: {
            source: "ActivityEvent",
            funnelEvents,
            telegramEvents,
          },
        });
      },
    },
  },
  component: () => null,
});

function toCountMap(
  rows: Array<{
    type: string;
    _count: { _all: number };
  }>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) out[row.type] = row._count._all;
  return out;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=60",
    },
  });
}
