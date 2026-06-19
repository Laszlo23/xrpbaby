import { createFileRoute } from "@tanstack/react-router";

import { BuilderTapesHub } from "@/components/stories/BuilderTapesHub";
import { BuilderTapesIndexConnected } from "@/components/stories/BuilderTapesIndexConnected";
import { StoryInterlude } from "@/modules/art/components/artwork/StoryInterlude";
import { ClientOnly } from "@/modules/art/components/web3/ClientOnly";
import { BUILDER_TAPES_SERIES } from "@/content/builder-tapes";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/stories/tapes/")({
  head: () =>
    pageHead({
      title: `Builder Tapes — ${BRAND_DISPLAY_NAME}`,
      description:
        "Real stories from the dial-up era to onchain culture — founder audio episodes with listen and share rewards.",
      path: "/stories/tapes",
      keywords: ["Builder Tapes", "founder story", "audio", "Building Culture", "Laszlo"],
    }),
  component: BuilderTapesIndexPage,
});

function BuilderTapesIndexPage() {
  return (
    <div className="min-h-screen bg-black pb-nav-safe text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <ClientOnly fallback={<BuilderTapesHub completedSlugs={[]} />}>
          <BuilderTapesIndexConnected />
        </ClientOnly>
        <StoryInterlude
          kicker="Voice memo archive"
          body="Culture Chronicles is the mythic graphic novel. Builder Tapes is the founder's unfiltered voice — same bucket, different truth."
          align="center"
        />
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          Narrated by {BUILDER_TAPES_SERIES.authorDisplayName}
        </p>
      </div>
    </div>
  );
}
