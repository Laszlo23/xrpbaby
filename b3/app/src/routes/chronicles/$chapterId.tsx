import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { getChronicle, CHRONICLES, chronicleSharePath } from "@/content/culture-chronicles";
import { ChronicleMintPanel } from "@/components/chronicles/ChronicleMintPanel";
import { ChroniclePointsClaim } from "@/components/chronicles/ChroniclePointsClaim";
import { ChroniclesIdentityBar } from "@/components/chronicles/ChroniclesIdentityBar";
import { useChronicleProgress } from "@/hooks/useChronicleProgress";
import { useForestMemberTasks } from "@/hooks/useForestMemberTasks";
import { useAccount } from "wagmi";
import { ArrowLeft, Headphones, Share2 } from "lucide-react";
import { warpcastComposeUrl } from "@/lib/campaign-share";
import { captureShareClicked } from "@/lib/analytics";
import { getServerPublicOrigin } from "@/lib/app-origin";
import { toast } from "sonner";
import { pickCoachSceneForQuest } from "@/lib/character/culture-coach";
import { builderTapesForChronicle } from "@/content/builder-tapes";

export const Route = createFileRoute("/chronicles/$chapterId")({
  head: ({ params }) => {
    const ch = getChronicle(params.chapterId);
    if (!ch) return {};
    return pageHead({
      title: `${ch.title} — Culture Chronicles`,
      description: ch.quote,
      path: chronicleSharePath(ch.id),
      image: ch.heroSrc,
      keywords: ["Culture Chronicles", ch.title, ch.tier],
    });
  },
  loader: ({ params }) => {
    const ch = getChronicle(params.chapterId);
    if (!ch) throw notFound();
    return ch;
  },
  component: ChronicleChapterPage,
});

function ChronicleChapterPage() {
  const chapter = Route.useLoaderData();
  const progress = useChronicleProgress();
  const { completedSlugs, refresh } = useForestMemberTasks();
  const { address } = useAccount();
  const owned = (progress.balances.get(chapter.editionId) ?? 0n) > 0n;
  const idx = CHRONICLES.findIndex((c) => c.id === chapter.id);
  const prev = idx > 0 ? CHRONICLES[idx - 1] : null;
  const next = idx >= 0 && idx < CHRONICLES.length - 1 ? CHRONICLES[idx + 1] : null;
  const coach = pickCoachSceneForQuest("chronicle-read", chapter.coachSceneId);
  const relatedTapes = builderTapesForChronicle(chapter.id);

  function onShare() {
    const origin = getServerPublicOrigin().replace(/\/$/, "");
    const url = `${origin}${chronicleSharePath(chapter.id)}`;
    const text = `${chapter.title} — Culture Chronicles on ${origin.replace(/^https?:\/\//, "")}`;
    captureShareClicked({ channel: "warpcast", context: "drop", drop_slug: chapter.id });
    const fc = warpcastComposeUrl(text, [url]);
    window.open(fc, "_blank", "noopener,noreferrer");
    void navigator.clipboard?.writeText(url).then(() => toast.success("Link copied"));
  }

  return (
    <div className="min-h-screen bg-black pb-nav-safe text-white">
      <ChroniclesIdentityBar />
      <section className="relative min-h-[48vh] w-full overflow-hidden">
        <img
          src={chapter.heroSrc}
          alt={chapter.title}
          className="h-[48vh] w-full object-cover opacity-95"
          loading="eager"
          onError={(e) => {
            e.currentTarget.src = chapter.bucketFallback;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 pt-24 md:px-10">
          <Link
            to="/chronicles"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All chapters
          </Link>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--vault-gold)]">
            Chapter {chapter.editionId} · {chapter.tier}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-3 max-w-xl text-lg italic text-zinc-300">
            &ldquo;{chapter.quote}&rdquo;
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1fr_340px] md:px-10">
        <article className="space-y-6">
          {chapter.narration.map((para: string) => (
            <p key={para} className="text-base leading-relaxed text-zinc-300">
              {para}
            </p>
          ))}
          {chapter.quoteWin ? (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
              Win line: {chapter.quoteWin}
            </p>
          ) : null}
          {relatedTapes.length > 0 ? (
            <div className="rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#00E5FF]">
                Real life behind this chapter
              </p>
              <ul className="mt-2 space-y-2">
                {relatedTapes.map((tape) => (
                  <li key={tape.slug}>
                    <Link
                      to="/stories/tapes/$slug"
                      params={{ slug: tape.slug }}
                      className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
                    >
                      <Headphones className="h-3.5 w-3.5 text-[#C5FF41]" aria-hidden />
                      {tape.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-4">
            {prev ? (
              <Link
                to="/chronicles/$chapterId"
                params={{ chapterId: prev.id }}
                className="text-sm text-zinc-400 underline hover:text-white"
              >
                ← {prev.title}
              </Link>
            ) : null}
            {next ? (
              <Link
                to="/chronicles/$chapterId"
                params={{ chapterId: next.id }}
                className="text-sm text-[var(--vault-gold)] underline hover:text-white"
              >
                Next: {next.title} →
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-zinc-400 hover:border-white/30 hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            Share chapter
          </button>
        </article>

        <aside className="space-y-6">
          <ChronicleMintPanel chapter={chapter} showSkipKey />
          <ChroniclePointsClaim
            chapter={chapter}
            owned={owned}
            completedSlugs={completedSlugs}
            onClaimed={() => void refresh()}
          />
          <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Culture Coach
            </p>
            <p className="mt-2 text-sm italic text-zinc-400">&ldquo;{coach.quote}&rdquo;</p>
          </div>
          {address ? (
            <p className="text-[11px] text-zinc-600">
              Set: {progress.ownedCount}/11
              {progress.isFounder ? " · Chronicle Founder" : ""}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
