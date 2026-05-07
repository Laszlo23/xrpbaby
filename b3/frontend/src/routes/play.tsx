/**
 * Culture quiz — isolated route (no main-nav hero link yet).
 * Share URLs for community posts: `/play?score=<n>&total=7` (optional `score` shows a hint banner).
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { CultureQuizGame } from "@/components/CultureQuizGame";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { CULTURE_QUIZ_SESSION_LENGTH } from "@/content/culture-quiz";

export const Route = createFileRoute("/play")({
  head: () =>
    pageHead({
      title: `Culture quiz — ${BRAND_DISPLAY_NAME}`,
      description:
        "Quick trivia on real-world prize pools, wallets, and how Building Culture talks about culture on-chain — play to learn.",
      path: "/play",
      keywords: ["Build Culture", "quiz", "RWA", "pools", "education", "community"],
    }),
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.score;
    const num = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : Number.NaN;
    const score = Number.isFinite(num)
      ? Math.max(0, Math.min(CULTURE_QUIZ_SESSION_LENGTH, Math.floor(num)))
      : undefined;
    return { score };
  },
  component: PlayPage,
});

function PlayPage() {
  const { score } = Route.useSearch();

  return (
    <MarketingShell
      eyebrow="Learn & play"
      tone="purple"
      heroSize="hero"
      articleClassName="max-w-4xl w-full"
      title={<>Culture quiz</>}
      subtitle="Seven questions — pools, prizes, and the honest stuff from our FAQ. No wallet required to play; connect for one-time quest XP."
      actions={
        <Link to="/faq">
          <span className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1]">
            FAQ
          </span>
        </Link>
      }
    >
      <CultureQuizGame sharedScoreHint={score} />
    </MarketingShell>
  );
}
