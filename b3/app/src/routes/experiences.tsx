import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { Quote, Sparkles } from "lucide-react";

const STORIES = [
  {
    quote:
      "Winning the Vienna stay felt surreal—Hilton week, three dinners, three art afternoons. Fulfillment was smooth; the team was on it.",
    who: "M., Berlin",
    tag: "Hilton Vienna week",
    when: "2025",
    featured: true,
  },
  {
    quote:
      "I didn’t think an on-chain ticket would turn into a real penthouse week. Berggasse was unreal—worth every mint.",
    who: "K., Amsterdam",
    tag: "Berggasse penthouse",
    when: "2025",
    featured: false,
  },
  {
    quote:
      "The ART Vienna drop wasn’t just the painting—the convention floor energy mattered. Documentation after the win was clear.",
    who: "S., Munich",
    tag: "ART Vienna + painting",
    when: "2024",
    featured: false,
  },
] as const;

export const Route = createFileRoute("/experiences")({
  head: () =>
    pageHead({
      title: "Experiences",
      description:
        "Real memories from BUILDCHAIN members — stays, art, and nights out won through provably fair drops.",
      path: "/experiences",
      keywords: ["BUILDCHAIN", "experiences", "winners", "RWA"],
    }),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const featured = STORIES.find((s) => s.featured);
  const rest = STORIES.filter((s) => !s.featured);

  return (
    <MarketingShell
      eyebrow="Proof, not hype"
      tone="amber"
      title={
        <>
          Voices from{" "}
          <span className="bg-gradient-to-r from-amber-100 via-white to-amber-200/90 bg-clip-text text-transparent">
            the winning side
          </span>
        </>
      }
      subtitle="Snapshots from players who turned tickets into trips, walls, and nights they still talk about—swap in your own verified stories anytime."
      actions={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/play"
            hash="drops"
            className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
          >
            Find your drop
          </Link>
          <Link
            to="/elias"
            className="inline-flex items-center justify-center rounded-full border border-amber-400/35 bg-amber-950/40 px-7 py-3 text-sm font-medium text-amber-50 ring-1 ring-white/10 transition hover:bg-amber-950/55 active:scale-[0.98]"
          >
            Elias Concierge
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-10">
        {featured ? (
          <figure className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-black/60 to-black p-8 md:p-10">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_30%,rgb(251_191_36/0.15),transparent_50%)]" />
            <Quote className="relative mb-4 h-8 w-8 text-amber-400/90" aria-hidden />
            <blockquote className="relative font-heading text-xl font-medium leading-snug text-zinc-100 md:text-2xl">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <figcaption className="relative mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <span className="text-zinc-300">{featured.who}</span>
              <span aria-hidden className="text-zinc-700">
                ·
              </span>
              <span>{featured.tag}</span>
              <span aria-hidden className="text-zinc-700">
                ·
              </span>
              <span>{featured.when}</span>
            </figcaption>
          </figure>
        ) : null}

        <ul className="grid gap-5 md:grid-cols-2">
          {rest.map((s) => (
            <li
              key={s.who}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-white/[0.14] hover:bg-white/[0.05]"
            >
              <Quote
                className="mb-3 h-5 w-5 text-neon/70 transition group-hover:text-neon"
                aria-hidden
              />
              <blockquote className="text-[15px] leading-relaxed text-zinc-200">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                {s.who} · {s.tag} · {s.when}
              </p>
            </li>
          ))}
        </ul>

        <p className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3 text-sm text-zinc-500">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
          Demo narratives—publish real winners with consent, photos, and drop IDs when you&apos;re
          ready.
        </p>
      </div>
    </MarketingShell>
  );
}
