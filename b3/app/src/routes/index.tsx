import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Building Culture — We Bring Places Back To Life",
      description:
        "Building Culture is creating a new way to fund, build, own and experience real-world communities. Not through banks. Through people.",
      path: "/",
      keywords: [
        "Building Culture",
        "community capital",
        "real estate",
        "tokenized property",
        "Vienna",
        "culture",
      ],
    }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
