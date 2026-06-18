import { createFileRoute, Link } from "@tanstack/react-router";

import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { fetchReputationLeaderboardFn } from "@/lib/reputation/leaderboard-fn";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/credentials/leaderboard")({
  head: () =>
    pageHead({
      title: "Culture Reputation Leaderboard",
      description: "Top Culture Layer builders by Culture Reputation.",
      path: "/credentials/leaderboard",
    }),
  loader: async () => {
    const entries = await fetchReputationLeaderboardFn({ data: { limit: 100 } });
    return { entries };
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { entries } = Route.useLoaderData();

  return (
    <MarketingShell
      eyebrow="Reputation"
      tone="lime"
      heroSize="compact"
      title="Culture Reputation leaderboard"
      subtitle="Top claimed `.culture` identities. Requires credentials or 30-day identity age for featured ranks (anti-spam)."
      actions={
        <Button variant="outline" className="rounded-full" asChild>
          <Link to="/credentials">Credential Center</Link>
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Handle</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  Leaderboard populates as Culture IDs earn reputation. Claim yours at{" "}
                  <Link to="/pass" className="text-[#C5FF41] hover:underline">
                    /pass
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              entries.map((row) => (
                <tr key={row.handle} className="border-b border-white/[0.04] text-zinc-300">
                  <td className="px-4 py-3 font-mono">{row.rank}</td>
                  <td className="px-4 py-3">
                    <Link to={`/id/${row.handle}` as "/id/$name"} params={{ name: row.handle }} className="hover:text-white">
                      {row.handle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono">{row.score > 0 ? row.score.toFixed(2) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MarketingShell>
  );
}
