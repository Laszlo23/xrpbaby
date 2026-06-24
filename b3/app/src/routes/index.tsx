import { createFileRoute } from "@tanstack/react-router";
import { LANDING_NORTH_STAR } from "@/lib/landing-copy";
import { LandingPage } from "@/components/landing/LandingPage";
import { pageHead, TALENTAPP_PROJECT_VERIFICATION } from "@/lib/seo";

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
      extraMeta: [
        {
          name: "talentapp:project_verification",
          content: TALENTAPP_PROJECT_VERIFICATION,
        },
      ],
    }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
