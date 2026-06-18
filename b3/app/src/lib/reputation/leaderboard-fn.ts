import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  limit: z.number().int().min(1).max(200).optional(),
});

export type LeaderboardEntry = {
  rank: number;
  handle: string;
  score: number;
  ownerAddress: string;
};

/** Server-only: Culture Reputation leaderboard. */
export const fetchReputationLeaderboardFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => inputSchema.parse(raw ?? {}))
  .handler(async ({ data }): Promise<LeaderboardEntry[]> => {
    const { getReputationLeaderboard } = await import("@/server/reputation/leaderboard");
    return getReputationLeaderboard(data.limit ?? 50);
  });
