import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { MapPin, Palette, Sparkles, Ticket, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About",
      description:
        "Join a community that plays for real stays, art, and moments across Europe—and proves the rules on-chain with BUILDCHAIN.",
      path: "/about",
      keywords: ["BUILDCHAIN", "about", "community", "onchain", "RWA"],
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MarketingShell
      eyebrow="Why we’re here"
      tone="rose"
      title={
        <>
          Built for people who{" "}
          <span className="bg-gradient-to-r from-white via-[#f9a8d4] to-[#c4b5fd] bg-clip-text text-transparent">
            chase the story
          </span>
          , not just the ticker.
        </>
      }
      subtitle="BUILDCHAIN is where travel, art, and play meet—fair drops, real venues, and a crew that shows up for the win and the hang afterward."
      actions={
        <>
          <Link
            to="/"
            hash="drops"
            className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
          >
            Browse drops
          </Link>
          <Link
            to="/collections"
            search={{ minted: undefined }}
            className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1] active:scale-[0.98]"
          >
            Open collection
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-14 md:gap-16">
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] via-black/40 to-[rgb(0_35_100/0.32)] p-8 md:p-10">
          <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(245_158_11/0.2),transparent_70%)]" />
          <div className="relative space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200/80">
              Building Culture Dollar
            </p>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-white md:text-2xl">
              XP · BCD · drops—one loop
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-[15px]">
              BCD is how we talk about value inside BUILDCHAIN: earn XP, grow your BCD balance (live
              ERC20 read when configured, demo label otherwise), and mint tickets into fair draws.
              On-chain settlement still follows today’s raffle contract—native token out until we
              ship a BCD-denominated mint path—so the product stays transparent while the economy
              layers in.
            </p>
            <p className="text-xs text-zinc-600">
              Use <span className="font-mono text-zinc-500">Get BCD</span> in the wallet row for a
              fixed-rate preview; a sale contract + env wiring unlocks the primary buy button when
              it exists.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <p className="text-lg leading-relaxed text-zinc-300 md:text-xl">
            Most apps promise future roads and vague utility. We&apos;re wired different:{" "}
            <strong className="font-medium text-white">
              you play for keys to places you actually want to be
            </strong>
            —a penthouse week, a museum-grade drop, a night in the city that only exists when
            you&apos;re there.
          </p>
          <p>
            Tickets live on-chain so the math isn&apos;t hiding in a spreadsheet. Quests and XP keep
            the loop fun even when you&apos;re between mints. When someone wins, fulfillment
            isn&apos;t lore—it&apos;s coordinated like a trip your friends would actually envy.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight text-white md:text-2xl">
            Three reasons players stick around
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Real places",
                body: "Stays and venues you can step into—not renders or maybe-one-day roadmaps.",
              },
              {
                icon: Palette,
                title: "Art & culture",
                body: "Drops tied to exhibitions, convention floors, and pieces you can hang—not JPEG filler.",
              },
              {
                icon: Ticket,
                title: "Fair mechanics",
                body: "Rules aimed at transparency: fewer backstage handshakes, more receipts you can read.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-neon">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[rgb(25_10_40/0.5)] p-8 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgb(0_82_255/0.35),transparent_70%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] ring-1 ring-white/10">
                <Users className="h-6 w-6 text-white/90" aria-hidden />
              </span>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Community
                </p>
                <p className="mt-1 font-heading text-lg font-semibold text-white md:text-xl">
                  Come for the drop. Stay for the crew.
                </p>
                <p className="mt-2 max-w-xl text-sm text-zinc-400">
                  Climb leaderboards, flex your collection, and bring friends—new chapters launch
                  every season.
                </p>
              </div>
            </div>
            <Link
              to="/leaderboard"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/[0.09] px-6 py-3 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/[0.14]"
            >
              See ranks
            </Link>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/30 px-5 py-4 text-sm text-zinc-500">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
          <span>
            Legal entity details ship when you go live—until then, read placeholder policies under{" "}
            <Link to="/legal/terms" className="text-zinc-300 underline-offset-2 hover:text-white">
              Legal
            </Link>{" "}
            and swap in counsel-reviewed copy before launch.
          </span>
        </section>
      </div>
    </MarketingShell>
  );
}
