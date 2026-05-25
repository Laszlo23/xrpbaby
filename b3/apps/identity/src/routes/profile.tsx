import { createFileRoute } from "@tanstack/react-router";
import { MiniProfile } from "@/components/mini/MiniProfile";
import { RedirectToMini } from "@/components/mini/RedirectToMini";
import { MiniRouteGate } from "@/components/mini/MiniRouteGate";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <MiniRouteGate fallback={<RedirectToMini />}>
      <MiniProfile />
    </MiniRouteGate>
  );
}
