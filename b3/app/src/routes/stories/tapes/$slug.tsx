import { createFileRoute, notFound } from "@tanstack/react-router";

import { BuilderTapeEpisodeView } from "@/components/stories/BuilderTapeEpisodeView";
import { getBuilderTape } from "@/content/builder-tapes";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/stories/tapes/$slug")({
  head: ({ params }) => {
    const tape = getBuilderTape(params.slug);
    if (!tape) return {};
    return pageHead({
      title: `${tape.title} — Builder Tapes`,
      description: tape.oneLiner,
      path: `/stories/tapes/${tape.slug}`,
      keywords: ["Builder Tapes", tape.title, tape.theme],
    });
  },
  loader: ({ params }) => {
    const tape = getBuilderTape(params.slug);
    if (!tape) throw notFound();
    return tape;
  },
  component: BuilderTapeEpisodePage,
});

function BuilderTapeEpisodePage() {
  const tape = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-black pb-nav-safe text-white">
      <BuilderTapeEpisodeView tape={tape} />
    </div>
  );
}
