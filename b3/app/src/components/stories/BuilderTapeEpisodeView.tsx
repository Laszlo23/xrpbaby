"use client";

import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useCallback, useState } from "react";

import {
  BuilderTapeListenClaim,
  isTapeListenClaimed,
} from "@/components/stories/BuilderTapeListenClaim";
import { BuilderTapePlayer } from "@/components/stories/BuilderTapePlayer";
import { BuilderTapeShareStrip } from "@/components/stories/BuilderTapeShareStrip";
import { CultureCoachBeat } from "@/components/quests/CultureCoachBeat";
import { SocialAmplifyPanel } from "@/components/quests/SocialAmplifyPanel";
import {
  BUILDER_TAPES_COMPLETE_ALL_SLUG,
  builderTapeListenTaskSlug,
  type BuilderTape,
} from "@/content/builder-tapes";
import { useBuilderTapeProgress } from "@/hooks/useBuilderTapeProgress";
import { useForestMemberTasks } from "@/hooks/useForestMemberTasks";
import { pickCoachSceneForQuest } from "@/lib/character/culture-coach";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { ClientOnly } from "@/modules/art/components/web3/ClientOnly";

type Props = {
  tape: BuilderTape;
};

function BuilderTapeEpisodeRewards({ tape }: Props) {
  const { completedSlugs, refresh } = useForestMemberTasks();
  const { progress, persist, listenRatio } = useBuilderTapeProgress(tape.slug);
  const [listenPayload, setListenPayload] = useState({
    listenedSeconds: progress?.currentTime ?? 0,
    durationSeconds: progress?.duration ?? tape.durationEstimate ?? 0,
  });

  const claimed = isTapeListenClaimed(completedSlugs, tape.slug);
  const seriesCompleteClaimed = completedSlugs.includes(BUILDER_TAPES_COMPLETE_ALL_SLUG);
  const origin = getPublicAppOrigin().replace(/\/$/, "");
  const episodeUrl = `${origin}/stories/tapes/${tape.slug}`;

  const onListenThreshold = useCallback(
    (payload: { listenedSeconds: number; durationSeconds: number }) => {
      setListenPayload(payload);
      persist(payload.listenedSeconds, payload.durationSeconds);
    },
    [persist],
  );

  return (
    <>
      <BuilderTapePlayer tape={tape} onListenThreshold={onListenThreshold} />

      <BuilderTapeListenClaim
        tape={tape}
        listenRatio={listenRatio}
        listenedSeconds={listenPayload.listenedSeconds}
        durationSeconds={listenPayload.durationSeconds}
        alreadyClaimed={claimed}
        seriesCompleteClaimed={seriesCompleteClaimed}
        onClaimed={() => void refresh()}
      />

      <SocialAmplifyPanel
        completedSlugs={completedSlugs}
        onClaimed={() => void refresh()}
        shareComposeOverride={{
          farcaster: `${tape.shareText} ${episodeUrl}`,
          x: `${tape.shareText} ${episodeUrl}`,
        }}
      />
    </>
  );
}

export function BuilderTapeEpisodeView({ tape }: Props) {
  const coach = pickCoachSceneForQuest(builderTapeListenTaskSlug(tape.slug), tape.coachSceneId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <Link
        to="/stories/tapes"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All Builder Tapes
      </Link>

      <div className="mt-8 space-y-8">
        <ClientOnly
          fallback={
            <>
              <BuilderTapePlayer tape={tape} />
              <p className="text-xs text-zinc-500">
                Connect wallet after load to claim Culture Points for listening.
              </p>
            </>
          }
        >
          <BuilderTapeEpisodeRewards tape={tape} />
        </ClientOnly>

        <CultureCoachBeat scene={coach} />

        <BuilderTapeShareStrip tape={tape} />

        {tape.relatedChronicleIds?.length || tape.relatedHref || tape.relatedStoryYear ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Related
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {tape.relatedStoryYear ? (
                <li>
                  <Link to="/story" className="text-[#00E5FF] hover:underline">
                    Builder chronicle · {tape.relatedStoryYear}
                  </Link>
                </li>
              ) : null}
              {tape.relatedChronicleIds?.map((id: string) => (
                <li key={id}>
                  <Link
                    to="/chronicles/$chapterId"
                    params={{ chapterId: id }}
                    className="text-[#C5FF41] hover:underline"
                  >
                    Culture Chronicles · {id.replace("ch-", "Chapter ")}
                  </Link>
                </li>
              ))}
              {tape.relatedHref ? (
                <li>
                  <Link to={tape.relatedHref} className="text-zinc-300 hover:underline">
                    Culture legacy dashboard
                  </Link>
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
