import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";

import { getPrisma } from "@/server/db/prisma";

const AGENT_ID = "elias-concierge-1";

export async function logEliasAgentAction(input: {
  action: string;
  params?: Record<string, unknown>;
  dryRun?: boolean;
  status: string;
  errorMsg?: string;
  costUsd?: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.agentActionLog.create({
      data: {
        id: randomUUID(),
        agentId: AGENT_ID,
        action: input.action,
        params: (input.params ?? undefined) as Prisma.InputJsonValue | undefined,
        dryRun: input.dryRun ?? false,
        status: input.status,
        errorMsg: input.errorMsg,
        costUsd: input.costUsd,
      },
    });
  } catch {
    /* non-fatal */
  }
}
