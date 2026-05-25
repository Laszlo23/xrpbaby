import { createFileRoute } from "@tanstack/react-router";
import { TaskBoard } from "@/components/mini/TaskBoard";
import { RedirectToMini } from "@/components/mini/RedirectToMini";
import { MiniRouteGate } from "@/components/mini/MiniRouteGate";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <MiniRouteGate fallback={<RedirectToMini />}>
      <TaskBoard />
    </MiniRouteGate>
  );
}
