import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
});

export type BcidLeaderboardEntry = {
  rank: number;
  did: string;
  publicHandle: string | null;
  cultureHandle: string | null;
  builderScore: number;
  trust: number;
  contribution: number;
  verification: number;
};

/** Server-only: BCID Builder Score leaderboard. */
export const fetchBcidLeaderboardFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => inputSchema.parse(raw ?? {}))
  .handler(async ({ data }): Promise<BcidLeaderboardEntry[]> => {
    const { fetchBcidLeaderboard } = await import("@/server/reputation/bcid-leaderboard");
    return fetchBcidLeaderboard(data.limit ?? 100);
  });
