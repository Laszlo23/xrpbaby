import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Trophy, TrendingUp, Flame } from "lucide-react";
import { LevelBadge } from "@/components/LevelBadge";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { getCampaignAddress } from "@/lib/campaign";
import { fetchMintedEvents, mintCountsByWallet } from "@/lib/indexer";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { postLeaderboard, postReferralLeaderboard30d } from "@/lib/points-fns";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/leaderboard")({
  head: () =>
    pageHead({
      title: "Leaderboard",
      description:
        "Top Build Culture builders ranked by quest points and on-chain raffle tickets — compete on Base.",
      path: "/leaderboard",
      keywords: ["Build Culture", "leaderboard", "Base", "points", "NFT tickets"],
    }),
  component: LeaderboardPage,
});

const rankColors = [
  "text-gold text-glow-gold",
  "text-neon text-glow-neon",
  "text-emerald text-glow-emerald",
];

type Tab = "points" | "tickets" | "referrals";

function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("points");
  const campaign = getCampaignAddress();
  const publicClient = usePublicClient();
  const fetchLeaderboard = useServerFn(postLeaderboard);
  const fetchReferralLb = useServerFn(postReferralLeaderboard30d);

  const { data: lbResult, isLoading: lbLoading } = useQuery({
    queryKey: ["leaderboard-points"],
    queryFn: async () => fetchLeaderboard({ data: {} }),
    staleTime: 25_000,
  });

  const { data: refLbResult, isLoading: refLoading } = useQuery({
    queryKey: ["leaderboard-referrals-30d"],
    queryFn: async () => fetchReferralLb({ data: { limit: 12 } }),
    staleTime: 25_000,
  });

  const { data: rows = [], isLoading: mintLoading } = useQuery({
    queryKey: ["mint-index", campaign],
    queryFn: async () => {
      if (!publicClient || !campaign) return [];
      return fetchMintedEvents(publicClient, campaign);
    },
    enabled: !!publicClient && !!campaign,
    staleTime: 20_000,
  });

  const counts = mintCountsByWallet(rows);
  const ticketSorted = Object.entries(counts)
    .map(([addr, tickets]) => ({
      addr,
      tickets,
      xp: tickets * 120 + Math.min(tickets * 40, 4000),
    }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 12)
    .map((r, i) => ({
      rank: i + 1,
      name: `${r.addr.slice(0, 6)}…${r.addr.slice(-4)}`,
      xp: r.xp,
      wins: 0,
      tickets: r.tickets,
      streak: Math.min(r.tickets, 15),
    }));

  const referralLeaders = useMemo(() => {
    if (!refLbResult?.ok || refLbResult.rows.length === 0) return [];
    return refLbResult.rows.map((r, i) => ({
      rank: i + 1,
      name: `${r.address.slice(0, 6)}…${r.address.slice(-4)}`,
      xp: r.points,
      wins: 0,
      tickets: 0,
      streak: 0,
    }));
  }, [refLbResult]);

  const pointsLeaders = useMemo(() => {
    if (!lbResult?.ok || lbResult.rows.length === 0) return [];
    return lbResult.rows.slice(0, 12).map((r, i) => ({
      rank: i + 1,
      name: `${r.address.slice(0, 6)}…${r.address.slice(-4)}`,
      xp: r.points,
      wins: 0,
      tickets: 0,
      streak: 0,
    }));
  }, [lbResult]);

  type Row = {
    rank: number;
    name: string;
    xp: number;
    wins: number;
    tickets: number;
    streak: number;
  };

  const display: Row[] = (() => {
    if (tab === "points") {
      if (!lbResult || lbLoading) return [];
      if (lbResult.ok) return pointsLeaders;
      return [];
    }
    if (tab === "referrals") {
      if (!refLbResult || refLoading) return [];
      if (refLbResult.ok) return referralLeaders;
      return [];
    }
    if (ticketSorted.length > 0) return ticketSorted;
    return [];
  })();

  const showEmptyHint =
    tab === "points"
      ? lbResult?.ok === true && pointsLeaders.length === 0 && !lbLoading
      : tab === "referrals"
        ? refLbResult?.ok === true && referralLeaders.length === 0 && !refLoading
        : !!campaign && ticketSorted.length === 0 && !mintLoading;

  const valueLabel = tab === "points" ? "Points" : tab === "referrals" ? "Ref pts" : "XP";
  const subLabel = tab === "points" ? "Tickets" : tab === "referrals" ? "30d" : "Minted";

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-gold" />
          <h1 className="font-heading text-2xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "points" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setTab("points")}
          >
            Points
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "tickets" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setTab("tickets")}
          >
            Tickets
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "referrals" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setTab("referrals")}
          >
            Refs 30d
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {tab === "points" ? (
          <>
            Ranked by summed {BRAND_DISPLAY_NAME} points from the server ledger (quests + daily
            check-ins).{" "}
            {lbResult?.ok === false && lbResult.reason === "no_database"
              ? "Configure DATABASE_URL and run migrations to show live ranks."
              : null}
          </>
        ) : tab === "referrals" ? (
          "Raffle referral bonus points from the last 30 days (off-chain attribution via ?ref=)."
        ) : campaign ? (
          "Ranked by indexed raffle mint events from the campaign contract."
        ) : (
          "Set VITE_RAFFLE_CAMPAIGN_ADDRESS (or use curated Base deployments) so ticket ranks can load."
        )}
      </p>

      {tab === "points" && lbLoading && (
        <p className="text-sm text-muted-foreground">Loading points ranks…</p>
      )}
      {tab === "referrals" && refLoading && (
        <p className="text-sm text-muted-foreground">Loading referral ranks…</p>
      )}
      {tab === "tickets" && campaign && mintLoading && (
        <p className="text-sm text-muted-foreground">Syncing mint index…</p>
      )}

      {tab === "referrals" && refLbResult?.ok === false && refLbResult.reason === "no_database" && (
        <p className="text-sm text-amber-600/90 dark:text-amber-400/90">
          Referral ranks need Postgres — set DATABASE_URL and run migrations.
        </p>
      )}
      {tab === "points" && lbResult?.ok === false && lbResult.reason === "no_database" && (
        <p className="text-sm text-amber-600/90 dark:text-amber-400/90">
          Points leaderboard needs Postgres — set DATABASE_URL on the server and run migrations.
        </p>
      )}
      {showEmptyHint && tab === "points" && (
        <p className="text-sm text-muted-foreground">
          No points on the ledger yet — complete quests on your profile to appear here.
        </p>
      )}
      {showEmptyHint && tab === "tickets" && (
        <p className="text-sm text-muted-foreground">No mints indexed yet for this campaign.</p>
      )}
      {showEmptyHint && tab === "referrals" && (
        <p className="text-sm text-muted-foreground">
          No referral points yet — share drop links with{" "}
          <span className="font-mono text-zinc-400">?ref=0x…</span> your wallet.
        </p>
      )}
      {tab === "tickets" && !campaign && !mintLoading && (
        <p className="text-sm text-muted-foreground">
          Configure the raffle campaign contract to rank wallets by minted tickets.
        </p>
      )}

      {/* Top 3 podium: 2nd — 1st — 3rd */}
      {display.length >= 3 ? (
        <div className="flex items-end justify-center gap-3 py-6">
          {[
            { row: display[1], slot: 1 as const },
            { row: display[0], slot: 0 as const },
            { row: display[2], slot: 2 as const },
          ].map(({ row: l, slot }) => {
            if (!l) return null;
            const heights = ["h-32", "h-24", "h-20"] as const;
            const sizes = ["text-2xl", "text-lg", "text-lg"] as const;
            return (
              <div
                key={`podium-${l.rank}-${l.name}`}
                className={`flex flex-col items-center gap-2 ${heights[slot]} justify-end`}
              >
                <div
                  className={`rounded-xl glass px-4 py-3 text-center border ${slot === 0 ? "border-gold/40 glow-gold" : "border-border"}`}
                >
                  <p
                    className={`font-heading font-bold ${sizes[slot]} ${rankColors[slot] ?? "text-foreground"}`}
                  >
                    #{l.rank}
                  </p>
                  <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {l.name}
                  </p>
                  <LevelBadge xp={l.xp} className="scale-75 mt-1 block" />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Full table */}
      <div className="glass rounded-2xl overflow-hidden border border-border">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
          <span className="col-span-2">Rank</span>
          <span className="col-span-4">Builder</span>
          <span className="col-span-2 text-right flex items-center justify-end gap-1">
            <TrendingUp className="h-3 w-3" /> {valueLabel}
          </span>
          <span className="col-span-2 text-right">Wins</span>
          <span className="col-span-2 text-right flex items-center justify-end gap-1">
            <Flame className="h-3 w-3" /> {subLabel}
          </span>
        </div>
        <div className="divide-y divide-border">
          {display.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No rows yet.</div>
          ) : null}
          {display.map((l) => (
            <div
              key={`${l.rank}-${l.name}`}
              className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm hover:bg-secondary/30 transition-colors"
            >
              <span className="col-span-2 font-heading font-bold text-muted-foreground">
                #{l.rank}
              </span>
              <span className="col-span-4 font-medium text-foreground truncate">{l.name}</span>
              <span className="col-span-2 text-right text-emerald font-mono">
                {l.xp.toLocaleString()}
              </span>
              <span className="col-span-2 text-right text-muted-foreground">{l.wins}</span>
              <span className="col-span-2 text-right font-mono text-neon">
                {tab === "referrals" ? "—" : l.tickets}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
