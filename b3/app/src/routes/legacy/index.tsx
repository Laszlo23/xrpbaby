import { createFileRoute } from "@tanstack/react-router";

import { LegacyDashboard } from "@/components/legacy/LegacyDashboard";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/legacy/")({
  component: LegacyPage,
  head: () =>
    pageHead({
      title: "Your legacy",
      description: "Culture memory, connections, signals, and your builder legacy dashboard.",
      path: "/legacy",
    }),
});

function LegacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <LegacyDashboard />
    </div>
  );
}
