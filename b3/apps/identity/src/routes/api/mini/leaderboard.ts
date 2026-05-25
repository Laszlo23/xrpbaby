import { createFileRoute } from "@tanstack/react-router";
import { getLeaderboard } from "@/lib/mini/db";
import { fetchUserByFid } from "@/lib/social/neynar";

export const Route = createFileRoute("/api/mini/leaderboard")({
  server: {
    handlers: {
      GET: async () => {
        const rows = await getLeaderboard(50);

        const entries = await Promise.all(
          rows.map(async (row) => {
            const profile = await fetchUserByFid(row.fid);
            return {
              fid: row.fid,
              xp: row.xp,
              level: row.level,
              rank: row.rank,
              username: profile?.username,
              displayName: profile?.displayName,
              pfpUrl: profile?.pfpUrl,
            };
          }),
        );

        return Response.json(
          { entries },
          {
            headers: { "Cache-Control": "public, max-age=60" },
          },
        );
      },
    },
  },
});
