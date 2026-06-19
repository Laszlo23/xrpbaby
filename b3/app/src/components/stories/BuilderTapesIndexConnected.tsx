"use client";

import { BuilderTapesHub } from "@/components/stories/BuilderTapesHub";
import { useForestMemberTasks } from "@/hooks/useForestMemberTasks";

export function BuilderTapesIndexConnected() {
  const { completedSlugs } = useForestMemberTasks();
  return <BuilderTapesHub completedSlugs={completedSlugs} />;
}
