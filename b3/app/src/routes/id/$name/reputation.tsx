import { createFileRoute, Link } from "@tanstack/react-router";

import { ReputationTimeline } from "@/components/reputation/ReputationTimeline";
import { CultureScore } from "@/components/profile/CultureScore";
import {
  fetchCultureIdentityTimelineFn,
  type ReputationTimelineEvent,
} from "@/lib/credentials/identity-fn";
import { fetchCultureNameResolution } from "@/lib/identity/resolve-fn";
import { fetchShowcaseEnrichmentFn } from "@/lib/profile/showcase-enrichment-fn";
import { pageHead } from "@/lib/seo";

const REPUTATION_EXPLANATION =
  "Culture Reputation combines credentials, contributions, social trust, onchain activity, and human verification.";

export const Route = createFileRoute("/id/$name/reputation")({
  loader: async ({ params }) => {
    const resolved = await fetchCultureNameResolution({ data: { name: params.name } });
    let enrichment = null;
    let timeline: Awaited<ReturnType<typeof fetchCultureIdentityTimelineFn>> = [];
    if (resolved.status === "claimed") {
      enrichment = await fetchShowcaseEnrichmentFn({ data: { name: params.name } });
      timeline = await fetchCultureIdentityTimelineFn({ data: { handle: params.name } });
    }
    return { resolved, enrichment, timeline };
  },
  head: ({ params }) =>
    pageHead({
      title: `${params.name} — Culture Reputation`,
      description: "Culture Reputation score, dimensions, and activity timeline.",
      path: `/id/${params.name}/reputation`,
    }),
  component: ProfileReputationPage,
});

function ProfileReputationPage() {
  const { name } = Route.useParams();
  const { resolved, enrichment, timeline } = Route.useLoaderData();

  if (resolved.status !== "claimed") {
    return (
      <div className="bc-surface min-h-dvh px-4 py-16 text-center text-zinc-400">
        <p>Reputation is available for claimed Culture IDs.</p>
        <Link to="/pass" className="mt-4 inline-block text-[#C5FF41] hover:underline">
          Claim Culture ID
        </Link>
      </div>
    );
  }

  const score = enrichment?.cultureScore;

  return (
    <div className="bc-surface relative min-h-dvh pb-24 text-white">
      <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to={`/id/${name}` as "/id/$name"}
            params={{ name }}
            className="text-zinc-500 hover:text-white"
          >
            ← {resolved.fullName}
          </Link>
          <span className="text-zinc-700">·</span>
          <Link
            to={`/id/${name}/credentials` as "/id/$name/credentials"}
            params={{ name }}
            className="text-zinc-500 hover:text-white"
          >
            Credentials
          </Link>
        </div>

        <h1 className="mt-6 font-display text-3xl font-bold">Culture Reputation</h1>
        <p className="mt-2 text-sm text-zinc-400">{REPUTATION_EXPLANATION}</p>

        {score ? (
          <div className="mt-8">
            <CultureScore
              score={score.score}
              note={score.note}
              rank={score.rank}
              dimensions={score.dimensions}
              explanation={REPUTATION_EXPLANATION}
            />
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-white">Reputation timeline</h2>
          <div className="mt-4">
            <ReputationTimeline
              events={timeline.map((e: ReputationTimelineEvent) => ({
                id: e.id,
                type: e.type,
                weight: e.weight,
                source: e.source,
                proofRef: e.proofRef,
                createdAt: e.createdAt,
                metadata: e.metadata,
              }))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
