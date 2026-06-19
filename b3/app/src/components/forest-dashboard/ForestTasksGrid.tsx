import { Link } from "@tanstack/react-router";

import { ForestTaskCard } from "@/components/forest-dashboard/ForestTaskCard";
import { FOREST_DASHBOARD_TASKS } from "@/lib/forest-dashboard-tasks";

type Props = {
  completedSlugs: string[];
  claimingSlug: string | null;
  claimDisabled: boolean;
  onClaimInline: (slug: string) => void;
};

export function ForestTasksGrid({
  completedSlugs,
  claimingSlug,
  claimDisabled,
  onClaimInline,
}: Props) {
  const doneCount = FOREST_DASHBOARD_TASKS.filter((t) => completedSlugs.includes(t.slug)).length;
  const wiredCount = FOREST_DASHBOARD_TASKS.filter((t) => t.kind !== "coming_soon").length;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Tasks</h2>
          <p className="mt-1 text-sm text-zinc-400">Complete tasks to earn Culture Points</p>
        </div>
        <div className="text-right">
          <p className="mono-label !text-zinc-500">
            {doneCount}/{wiredCount} done
          </p>
          <Link
            to="/forest/quests"
            className="text-xs text-[#C5FF41] underline underline-offset-2 hover:text-white"
          >
            View all founding quests →
          </Link>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FOREST_DASHBOARD_TASKS.map((task) => (
          <ForestTaskCard
            key={task.slug}
            task={task}
            done={completedSlugs.includes(task.slug)}
            claiming={claimingSlug === task.slug}
            claimDisabled={claimDisabled}
            onClaimInline={onClaimInline}
          />
        ))}
      </div>
    </section>
  );
}
