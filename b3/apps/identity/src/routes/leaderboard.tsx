import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/components/mini/Leaderboard";
import { RedirectToMini } from "@/components/mini/RedirectToMini";
import { MiniRouteGate } from "@/components/mini/MiniRouteGate";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <MiniRouteGate fallback={<RedirectToMini />}>
      <Leaderboard />
    </MiniRouteGate>
  );
}
