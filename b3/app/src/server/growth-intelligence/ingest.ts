import type { Prisma, PrismaClient } from "@prisma/client";
import type { GrowthEventInput } from "@bc/growth-intelligence/server";

import { hashIp } from "./auth";

type IngestPayload = {
  sessionId: string;
  events: Array<Omit<GrowthEventInput, "kind"> & { kind: string }>;
  walletAddress?: string;
  memberId?: string;
};

export async function ingestGrowthEvents(
  prisma: PrismaClient,
  appId: string,
  payload: IngestPayload,
  requestMeta: { userAgent?: string; ip?: string },
): Promise<{ accepted: number }> {
  const { sessionId, events, walletAddress, memberId } = payload;
  if (!events.length) return { accepted: 0 };

  const ipHash = requestMeta.ip ? hashIp(requestMeta.ip) : undefined;

  let session = await prisma.growthSession.findFirst({
    where: { appId, anonymousId: sessionId },
  });

  if (!session) {
    session = await prisma.growthSession.create({
      data: {
        appId,
        anonymousId: sessionId,
        walletAddress,
        memberId,
        userAgent: requestMeta.userAgent,
        ipHash,
      },
    });
  } else {
    await prisma.growthSession.update({
      where: { id: session.id },
      data: {
        lastSeenAt: new Date(),
        walletAddress: walletAddress ?? session.walletAddress,
        memberId: memberId ?? session.memberId,
      },
    });
  }

  const rows = events.map((ev) => ({
    appId,
    sessionId: session!.id,
    kind: ev.kind,
    pathname: ev.pathname.slice(0, 512),
    selector: ev.selector?.slice(0, 512),
    x: ev.x ?? null,
    y: ev.y ?? null,
    scrollDepth: ev.scrollDepth ?? null,
    viewportW: ev.viewportW ?? null,
    viewportH: ev.viewportH ?? null,
    meta: (ev.meta ?? undefined) as Prisma.InputJsonValue | undefined,
    occurredAt: ev.ts ? new Date(ev.ts) : new Date(),
  }));

  await prisma.growthEvent.createMany({ data: rows });
  return { accepted: rows.length };
}
