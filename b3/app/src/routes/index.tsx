import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Building Culture — The Home of Community-Owned Growth",
      description:
        "Portable Web3 reputation, community campaigns, AI agents, and grant proof — an operating system for communities that build culture, not just attention.",
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
