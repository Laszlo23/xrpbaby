import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const handleSchema = z.object({
  handle: z.string().min(1).max(128),
});

export type ReputationTimelineEvent = {
  id: string;
  type: string;
  weight: number;
  source: string;
  proofRef: string | null;
  createdAt: string;
  metadata: Record<string, string | number | boolean | null> | null;
};

/** Server-only: Culture identity + reputation timeline for a handle. */
export const fetchCultureIdentityTimelineFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => handleSchema.parse(raw))
  .handler(async ({ data }): Promise<ReputationTimelineEvent[]> => {
    const { findCultureIdentityByHandle } = await import("@/server/credentials/identity");
    const identity = await findCultureIdentityByHandle(data.handle);
    return (identity?.reputationEvents ?? []).map((event) => ({
      id: event.id,
      type: event.type,
      weight: event.weight,
      source: event.source,
      proofRef: event.proofRef,
      createdAt: event.createdAt.toISOString(),
      metadata:
        (event.metadata as Record<string, string | number | boolean | null> | null | undefined) ??
        null,
    }));
  });
