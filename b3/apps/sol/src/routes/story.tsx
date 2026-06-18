import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  HandHeart,
  Hexagon,
  Moon,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";

import { LandingNav } from "@/components/landing/LandingNav";
import { STORY_BEATS, STORY_FUNNEL_STEPS } from "@/lib/story-data";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "The Road — From Nothing Worked to One Thing That Did | RESET" },
      {
        name: "description",
        content:
          "A personal story from chaos to clarity — why sticking to one build changed everything, and why we walk the same road together.",
      },
    ],
  }),
  component: StoryPage,
});

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal">
      <span className="h-px w-8 bg-signal" />
      {children}
    </div>
  );
}

const phaseStyles = {
  dark: "border-border bg-surface",
  turn: "border-signal/40 bg-signal/5",
  bright: "border-signal/30 bg-background",
  together: "border-signal bg-signal/10",
} as const;

const phaseIcons = {
  dark: Moon,
  turn: Sparkles,
  bright: Sun,
  together: Users,
} as const;

function StoryHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.02_260_/_0.35),transparent_55%)]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Eyebrow>Personal success funnel</Eyebrow>
        <h1 className="mt-8 font-display text-4xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
          Nothing worked
          <br />
          <span className="text-muted-foreground">until I built</span>
          <br />
          <span className="text-signal">one thing — and stuck.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          This isn&apos;t a guru pitch. It&apos;s the road from dark to bright — and an invitation
          to walk it with people who actually show up for each other.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#beats"
            className="inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-surface"
          >
            Read the story
          </a>
          <Link
            to="/join"
            className="group inline-flex items-center gap-2 bg-signal px-6 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground"
          >
            Start your reset
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StoryBeats() {
  return (
    <section id="beats" className="border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Dark → turn → bright → together
        </p>
        <div className="mt-12 space-y-8">
          {STORY_BEATS.map((beat, index) => {
            const Icon = phaseIcons[beat.phase];
            return (
              <article
                key={beat.id}
                className={`border p-8 md:p-10 ${phaseStyles[beat.phase]} transition-colors`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-signal" strokeWidth={1.5} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {beat.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold md:text-3xl">{beat.headline}</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  {beat.body}
                </p>
                {beat.pullQuote && (
                  <blockquote className="mt-6 border-l-2 border-signal pl-4 font-display text-lg font-medium italic text-foreground">
                    &ldquo;{beat.pullQuote}&rdquo;
                  </blockquote>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StoryFunnel() {
  return (
    <section className="border-t border-border bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Eyebrow>The same road</Eyebrow>
        <h2 className="mt-6 font-display text-4xl font-bold md:text-5xl">
          Your funnel — if you&apos;re ready
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          RESET isn&apos;t another content library. It&apos;s a sequence: feel the cost, commit to
          one track, prove you showed up, help someone else start.
        </p>
        <ol className="mt-12 space-y-px border border-border bg-border">
          {STORY_FUNNEL_STEPS.map((item) => (
            <li
              key={item.step}
              className="flex flex-col gap-2 bg-background p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
            >
              <span className="font-mono text-sm text-signal">{item.step}</span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-xl font-bold">{item.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StoryTogether() {
  return (
    <section className="relative overflow-hidden border-t border-border py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.92_0.19_110_/_0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-signal/40 bg-signal/10">
          <HandHeart className="h-7 w-7 text-signal" strokeWidth={1.5} />
        </div>
        <h2 className="mt-8 font-display text-4xl font-bold md:text-5xl">
          We don&apos;t climb alone.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Share your link. Bring your person. Log proof together. When someone you care about starts
          their reset because you showed them it was possible — that&apos;s not marketing.
          That&apos;s how communities actually get built.
        </p>
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
          {[
            ["Show up", "Daily rituals + mood"],
            ["Prove it", "Evidence on your wall"],
            ["Lift someone", "Partner + treasury"],
          ].map(([title, sub]) => (
            <div key={title} className="bg-background p-6">
              <div className="font-display text-lg font-bold">{title}</div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {sub}
              </p>
            </div>
          ))}
        </div>
        <Link
          to="/join"
          className="group mt-12 inline-flex items-center gap-3 bg-signal px-10 py-5 font-mono text-sm font-semibold uppercase tracking-widest text-signal-foreground shadow-brutal transition-all hover:translate-x-[-3px] hover:translate-y-[-3px]"
        >
          I&apos;m ready — unlock Day 1
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Same road. Your story. We help each other.
        </p>
      </div>
    </section>
  );
}

function StoryFooter() {
  return (
    <footer className="border-t border-border bg-surface py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="flex items-center gap-2 hover:text-foreground">
          <Hexagon className="h-4 w-4 fill-signal text-signal" />
          RESET
        </Link>
        <Link to="/join" className="text-signal hover:underline">
          Start your reset →
        </Link>
      </div>
    </footer>
  );
}

function StoryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <StoryHero />
      <StoryBeats />
      <StoryFunnel />
      <StoryTogether />
      <StoryFooter />
    </main>
  );
}
