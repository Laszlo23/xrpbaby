import { Link } from "@tanstack/react-router";
import { Compass, Sparkles, Trophy, UserRound, Users } from "lucide-react";
import { useAiCoach } from "@/contexts/AiCoachContext";
import { BCD_SYMBOL } from "@/lib/bcd-config";

function externalCommunityUrls(): { href: string; label: string }[] {
  const discord = import.meta.env.VITE_COMMUNITY_DISCORD_URL as string | undefined;
  const x = import.meta.env.VITE_COMMUNITY_X_URL as string | undefined;
  const out: { href: string; label: string }[] = [];
  if (discord?.trim()) out.push({ href: discord.trim(), label: "Discord" });
  if (x?.trim()) out.push({ href: x.trim(), label: "X (Twitter)" });
  return out;
}

const tiles = [
  {
    to: "/leaderboard",
    icon: Trophy,
    title: "Leaderboard",
    subtitle: "XP, quests, bragging rights",
    accent: "from-amber-500/15 to-transparent",
    iconClass: "text-amber-300",
  },
  {
    to: "/experiences",
    icon: Compass,
    title: "Experiences",
    subtitle: "Spotlight drops & IRL loops",
    accent: "from-cyan-500/12 to-transparent",
    iconClass: "text-cyan-300",
  },
  {
    to: "/profile",
    icon: UserRound,
    title: "Your profile",
    subtitle: "Quests, builder card, links",
    accent: "from-[rgb(0_82_255/0.18)] to-transparent",
    iconClass: "text-neon",
  },
] as const;

/**
 * High-signal community entry points—always visible on home so play isn’t buried in the footer alone.
 */
export function CommunityPulse() {
  const external = externalCommunityUrls();
  const { openCoach } = useAiCoach();

  return (
    <section
      id="community"
      className="scroll-mt-24 border-b border-white/[0.06] bg-[radial-gradient(ellipse_at_top,_rgb(0_35_90/0.32),_transparent_55%)] px-4 py-10 md:scroll-mt-28 md:px-8 md:py-12"
      aria-labelledby="community-pulse-heading"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
              Community
            </p>
            <h2
              id="community-pulse-heading"
              className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Plug in—don&apos;t solo the grind
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Share wins → earn XP on your profile. Rank up, book experiences, wire your builder
              profile—and read the{" "}
              <Link to="/mission" className="text-zinc-300 underline-offset-2 hover:text-white">
                Building Culture mission
              </Link>{" "}
              for {BCD_SYMBOL} genesis context. Hangouts surface when URLs are set.
            </p>
          </div>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-600 sm:inline">
            <Users className="mr-1.5 inline h-3.5 w-3.5 text-zinc-500" aria-hidden />
            Live loops
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map(({ to, icon: Icon, title, subtitle, accent, iconClass }) => (
            <Link
              key={to}
              to={to}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${accent} p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_12px_40px_-20px_rgb(0_82_255/0.45)] active:translate-y-0 active:scale-[0.99]`}
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 ${iconClass} ring-1 ring-white/[0.06] transition group-hover:ring-[rgb(0_82_255/0.35)]`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 font-heading text-lg font-semibold text-zinc-100">{title}</p>
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
              <span className="mt-4 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 transition group-hover:text-zinc-400">
                Open →
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <button
            type="button"
            onClick={openCoach}
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(0_82_255/0.35)] bg-[rgb(0_82_255/0.12)] px-5 py-2.5 text-sm font-medium text-zinc-100 shadow-[0_0_28px_-12px_rgb(0_82_255/70%)] transition hover:border-[rgb(0_82_255/0.55)] hover:bg-[rgb(0_82_255/0.18)] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 text-neon" aria-hidden />
            Pulse Coach (AI)
          </button>
          <span className="max-w-xs text-center text-[13px] leading-snug text-zinc-600 md:max-w-none md:text-left">
            Personalized next steps for drops, XP &amp; BCD—runs on-device chat UI, model on the
            server.
          </span>
        </div>

        {external.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 md:px-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
              Hang out
            </span>
            {external.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-[rgb(0_82_255/0.45)] hover:bg-white/[0.1] hover:text-white active:scale-[0.98]"
              >
                {s.label}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm leading-relaxed text-zinc-600 md:text-left">
            Official hangout links land here when they&apos;re live—for now, climb{" "}
            <Link to="/leaderboard" className="text-zinc-400 underline-offset-2 hover:text-white">
              ranks
            </Link>{" "}
            and shape your{" "}
            <Link to="/profile" className="text-zinc-400 underline-offset-2 hover:text-white">
              builder profile
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
