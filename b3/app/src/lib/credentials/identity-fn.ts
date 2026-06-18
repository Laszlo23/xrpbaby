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
  createdAt: Date;
  metadata: unknown;
};

/** Server-only: Culture identity + reputation timeline for a handle. */
export const fetchCultureIdentityTimelineFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => handleSchema.parse(raw))
  .handler(async ({ data }): Promise<ReputationTimelineEvent[]> => {
    const { findCultureIdentityByHandle } = await import("@/server/credentials/identity");
    const identity = await findCultureIdentityByHandle(data.handle);
    return identity?.reputationEvents ?? [];
  });
