import type { PrismaClient } from "@prisma/client";

const FUNNEL_EVENTS = [
  "analytics:landing_view",
  "analytics:wallet_connected",
  "analytics:mint_clicked",
  "analytics:mint_confirmed",
] as const;

type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

type PayloadRecord = Record<string, unknown>;

function payloadString(payload: unknown, key: string): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const value = (payload as PayloadRecord)[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function emptyFunnel(): Record<FunnelEvent, number> {
  return {
    "analytics:landing_view": 0,
    "analytics:wallet_connected": 0,
    "analytics:mint_clicked": 0,
    "analytics:mint_confirmed": 0,
  };
}

function conversionRates(funnel: Record<FunnelEvent, number>) {
  const views = funnel["analytics:landing_view"] || 0;
  const connected = funnel["analytics:wallet_connected"] || 0;
  const clicked = funnel["analytics:mint_clicked"] || 0;
  const confirmed = funnel["analytics:mint_confirmed"] || 0;
  return {
    viewToConnect: views ? connected / views : 0,
    connectToClick: connected ? clicked / connected : 0,
    clickToConfirm: clicked ? confirmed / clicked : 0,
    viewToConfirm: views ? confirmed / views : 0,
  };
}

export async function getAttributionDashboard(prisma: PrismaClient) {
  const now = new Date();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const events = await prisma.activityEvent.findMany({
    where: {
      type: { in: [...FUNNEL_EVENTS] },
      createdAt: { gte: last30d },
    },
    select: { type: true, payload: true, createdAt: true },
  });

  const windows = {
    last7d: {
      funnel: emptyFunnel(),
      byAgentRef: {} as Record<string, Record<FunnelEvent, number>>,
      byUtmSource: {} as Record<string, Record<FunnelEvent, number>>,
      byPathname: {} as Record<string, Record<FunnelEvent, number>>,
    },
    last30d: {
      funnel: emptyFunnel(),
      byAgentRef: {} as Record<string, Record<FunnelEvent, number>>,
      byUtmSource: {} as Record<string, Record<FunnelEvent, number>>,
      byPathname: {} as Record<string, Record<FunnelEvent, number>>,
    },
  };

  function bump(
    bucket: Record<string, Record<FunnelEvent, number>>,
    key: string,
    type: FunnelEvent,
  ) {
    if (!bucket[key]) bucket[key] = emptyFunnel();
    bucket[key][type] += 1;
  }

  for (const row of events) {
    const type = row.type as FunnelEvent;
    if (!FUNNEL_EVENTS.includes(type)) continue;
    const windowKey = row.createdAt >= last7d ? "last7d" : null;
    windows.last30d.funnel[type] += 1;
    if (windowKey) windows.last7d.funnel[type] += 1;

    const agentRef = payloadString(row.payload, "agent_ref") ?? "(direct)";
    const utmSource = payloadString(row.payload, "utm_source") ?? "(none)";
    const pathname = payloadString(row.payload, "pathname") ?? "(unknown)";

    bump(windows.last30d.byAgentRef, agentRef, type);
    bump(windows.last30d.byUtmSource, utmSource, type);
    bump(windows.last30d.byPathname, pathname, type);
    if (windowKey) {
      bump(windows.last7d.byAgentRef, agentRef, type);
      bump(windows.last7d.byUtmSource, utmSource, type);
      bump(windows.last7d.byPathname, pathname, type);
    }
  }

  const topAgents7d = Object.entries(windows.last7d.byAgentRef)
    .map(([agentRef, funnel]) => ({
      agentRef,
      funnel,
      rates: conversionRates(funnel),
      joins: funnel["analytics:wallet_connected"],
    }))
    .sort((a, b) => b.joins - a.joins)
    .slice(0, 20);

  return {
    ok: true,
    generatedAt: now.toISOString(),
    windows: {
      last7d: {
        funnel: windows.last7d.funnel,
        conversion: conversionRates(windows.last7d.funnel),
        topAgentRefs: topAgents7d,
      },
      last30d: {
        funnel: windows.last30d.funnel,
        conversion: conversionRates(windows.last30d.funnel),
      },
    },
    notes: {
      source: "ActivityEvent.payload (agent_ref, utm_source, pathname)",
      funnelEvents: FUNNEL_EVENTS,
    },
  };
}
