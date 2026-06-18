import { createFileRoute } from "@tanstack/react-router";

import { GrowthIntelligencePage } from "@/components/growth-intelligence/GrowthIntelligencePage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/intelligence")({
  head: () =>
    pageHead({
      title: "Growth Intelligence",
      description: "Internal growth analytics dashboard for Building Culture operators.",
      path: "/intelligence",
      noIndex: true,
    }),
  component: IntelligenceRoute,
});

function IntelligenceRoute() {
  return <GrowthIntelligencePage />;
}
