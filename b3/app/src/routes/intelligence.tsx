import { createFileRoute } from "@tanstack/react-router";

import { GrowthIntelligencePage } from "@/components/growth-intelligence/GrowthIntelligencePage";

export const Route = createFileRoute("/intelligence")({
  component: IntelligenceRoute,
});

function IntelligenceRoute() {
  return <GrowthIntelligencePage />;
}
