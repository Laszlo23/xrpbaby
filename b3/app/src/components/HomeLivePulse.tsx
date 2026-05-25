import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy } from "lucide-react";
import { postLeaderboard } from "@/lib/points-fns";
import { totalTicketEntries } from "@/content/home-drops";

/** Live entries stat + mini leaderboard — makes the homepage feel “in motion”. */
export function HomeLivePulse() {
  const fetchLb = useServerFn(postLeaderboard);
  const rawOverride = import.meta.env.VITE_PUBLIC_STATS_ENTRIES as string | undefined;
  const parsed = rawOverride?.trim() ? Number(rawOverride) : NaN;
  const entries = Number.isFinite(parsed) && parsed >= 0 ? parsed : totalTicketEntries();

  const { data, isLoading } = useQuery({
    queryKey: ["home-leaderboard-preview"],
    queryFn: async () => fetchLb({ data: { limit: 5 } }),
    staleTime: 30_000,
    // Avoid streaming “Loading ranks…” in SSR HTML; fetch after hydration only.
    enabled: typeof document !== "undefined",
  });

  const top = data?.ok ? data.rows.slice(0, 3) : [];

  return (
    <section
      className="border-b border-white/[0.06] bg-gradient-to-r from-black via-[rgb(212_175_55/0.04)] to-black px-4 py-8 md:px-8"
      aria-labelledby="live-pulse-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10">
        <div className="flex-1 space-y-3">
          <p
            id="live-pulse-heading"
            className="font-heading text-2xl font-semibold tabular-nums text-white md:text-3xl"
          >
            {entries.toLocaleString()}{" "}
            <span className="text-base font-normal text-zinc-500 md:text-lg">
              ticket entries in play
            </span>
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--vault-gold)]">
            enter → compete → win → flex
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to="/profile"
              className="rounded-full border border-white/[0.12] bg-black/40 px-4 py-2 text-sm text-zinc-200 hover:border-[rgb(212_175_55/0.35)] hover:text-white"
            >
              Share → earn XP
            </Link>
            <Link
              to="/campaign"
              search={{ ref: undefined }}
              className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/15"
            >
              Invite → bonus tickets
            </Link>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-zinc-500">
            Social tasks on Profile are part of our active fundraising and growth season — we keep
            building in public; this is not a one-and-done launch.
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-white/[0.08] bg-black/35 p-5 vault-spotlight">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Leaderboard preview
            </p>
            <Trophy className="h-4 w-4 text-[var(--vault-gold)]" aria-hidden />
          </div>
          {isLoading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading ranks…</p>
          ) : top.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              {data?.ok === false && data.reason === "no_database"
                ? "Points ledger needs DATABASE_URL / Postgres on the server — "
                : "Top wallets appear here when the leaderboard API responds — "}
              <Link to="/leaderboard" className="text-zinc-300 underline-offset-2 hover:text-white">
                open leaderboard
              </Link>
              .
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {top.map((row, i) => (
                <li
                  key={row.address}
                  className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2 text-sm last:border-0 last:pb-0"
                >
                  <span className="font-mono text-xs text-zinc-500">#{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-200">
                    {row.address.slice(0, 6)}…{row.address.slice(-4)}
                  </span>
                  <span className="font-heading text-sm tabular-nums text-emerald-400">
                    {row.points} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Link
            to="/leaderboard"
            className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white"
          >
            Full ranks →
          </Link>
        </div>
      </div>
    </section>
  );
}
