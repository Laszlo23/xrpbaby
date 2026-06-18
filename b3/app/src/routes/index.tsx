import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LANDING_NORTH_STAR } from "@/lib/landing-copy";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Building Culture — The Home of Community-Owned Growth",
      description: LANDING_NORTH_STAR,
      path: "/",
      keywords: [
        "Building Culture",
        "community OS",
        "Web3 reputation",
        "campaign hub",
        "AI agents",
        "grant proof",
        "community ownership",
      ],
    }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
