import { createFileRoute, Link } from "@tanstack/react-router";

import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import {
  fetchBcidLeaderboardFn,
  type BcidLeaderboardEntry,
} from "@/lib/reputation/bcid-leaderboard-fn";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/bcid/leaderboard")({
  head: () =>
    pageHead({
      title: "BCID Builder Leaderboard",
      description: "Top BCID holders by Builder Score — verifiable contributions, not followers.",
      path: "/bcid/leaderboard",
    }),
  loader: async () => {
    const entries = await fetchBcidLeaderboardFn({ data: { limit: 100 } });
    return { entries };
  },
  component: BcidLeaderboardPage,
});

function BcidLeaderboardPage() {
  const { entries } = Route.useLoaderData();

  return (
    <MarketingShell
      eyebrow="BCID"
      tone="lime"
      heroSize="compact"
      title="BCID Builder leaderboard"
      subtitle="Ranked by Builder Score — shipped work, not social vanity metrics."
      actions={
        <>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/bcid">Mint BCID</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/credentials/leaderboard">Culture Reputation</Link>
          </Button>
        </>
      }
    >
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Handle / DID</th>
              <th className="px-4 py-3 font-medium">Builder</th>
              <th className="px-4 py-3 font-medium">Trust</th>
              <th className="px-4 py-3 font-medium">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No BCIDs yet. Be first —{" "}
                  <Link to="/bcid/mint" className="text-[#C5FF41] hover:underline">
                    mint your Human BCID
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              entries.map((row: BcidLeaderboardEntry) => {
                const label =
                  row.cultureHandle ?? row.publicHandle ?? `${row.did.slice(0, 24)}…`;
                const profilePath = row.cultureHandle
                  ? (`/id/${row.cultureHandle}` as "/id/$name")
                  : null;

                return (
                  <tr key={row.did} className="border-b border-white/[0.04] text-zinc-300">
                    <td className="px-4 py-3 font-mono">{row.rank}</td>
                    <td className="px-4 py-3">
                      {profilePath ? (
                        <Link
                          to={profilePath}
                          params={{ name: row.cultureHandle! }}
                          className="text-[#C5FF41] hover:underline"
                        >
                          {label}
                        </Link>
                      ) : (
                        label
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">{row.builderScore.toFixed(0)}</td>
                    <td className="px-4 py-3 font-mono">{row.trust.toFixed(0)}</td>
                    <td className="px-4 py-3 font-mono">{row.contribution.toFixed(0)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </MarketingShell>
  );
}
