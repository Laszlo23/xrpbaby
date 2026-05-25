import { createFileRoute } from "@tanstack/react-router";
import {
  verifyQuickAuthRequest,
  unauthorizedResponse,
} from "@/lib/mini/auth";
import {
  getCompletedTaskIds,
  completeTask,
  getOrCreateUser,
} from "@/lib/mini/db";
import { getTaskById, type TaskId } from "@/lib/mini/tasks";
import { verifyTask } from "@/lib/mini/verify";
import { levelFromXp } from "@/lib/mini/gamification";

export const Route = createFileRoute("/api/mini/tasks/$taskId/verify")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const auth = await verifyQuickAuthRequest(request);
        if (!auth) return unauthorizedResponse();

        const taskId = params.taskId as TaskId;
        const task = getTaskById(taskId);
        if (!task) {
          return Response.json({ ok: false, error: "Unknown task" }, { status: 400 });
        }

        const completed = await getCompletedTaskIds(auth.fid);
        if (completed.has(taskId)) {
          const user = await getOrCreateUser(auth.fid);
          return Response.json({
            ok: true,
            alreadyCompleted: true,
            xp: user.xp,
            xpAwarded: 0,
          });
        }

        const result = await verifyTask(auth.fid, taskId);
        if (!result.ok) {
          return Response.json({ ok: false, error: result.error }, { status: 400 });
        }

        const user = await completeTask(
          auth.fid,
          taskId,
          task.xp,
          result.proof,
        );
        const { level } = levelFromXp(user.xp);

        return Response.json({
          ok: true,
          xp: user.xp,
          level,
          xpAwarded: task.xp,
        });
      },
    },
  },
});
