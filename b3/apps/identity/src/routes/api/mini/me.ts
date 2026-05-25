import { createFileRoute } from "@tanstack/react-router";
import {
  verifyQuickAuthRequest,
  unauthorizedResponse,
} from "@/lib/mini/auth";
import { getCompletedTaskIds, getOrCreateUser } from "@/lib/mini/db";
import { levelFromXp } from "@/lib/mini/gamification";

export const Route = createFileRoute("/api/mini/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await verifyQuickAuthRequest(request);
        if (!auth) return unauthorizedResponse();

        const user = await getOrCreateUser(auth.fid);
        const completed = await getCompletedTaskIds(auth.fid);
        const { level } = levelFromXp(user.xp);

        return Response.json({
          fid: auth.fid,
          xp: user.xp,
          level,
          completed: [...completed],
        });
      },
    },
  },
});
