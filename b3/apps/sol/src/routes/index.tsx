import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  Brain,
  Coins,
  ShieldCheck,
  Zap,
  Flame,
  Target,
  Rocket,
  Hammer,
  Check,
  Star,
  Infinity as InfinityIcon,
  Hexagon,
  Video,
  Calendar,
  Download,
  Waves,
  Play,
  FileText,
  Music,
} from "lucide-react";
import heroImg from "@/assets/hero-build.jpg";
import { LandingNav } from "@/components/landing/LandingNav";
import { TRACKS } from "@/lib/tracks-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESET — New Identity. New Discipline. New Life." },
      {
        name: "description",
        content:
          "A membership for people becoming sober, clear, and unrecognizable to their old selves. Instant Day 1 delivery. Partner program with 3-level commissions.",
      },
      { property: "og:title", content: "RESET — New Identity. New Discipline. New Life." },
      {
        property: "og:description",
        content:
          "Sign up and instantly unlock rituals, worksheets, and your Day 1 protocol. Share and earn as a partner.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
});

/* ---------- shared bits ---------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal">
      <span className="h-px w-8 bg-signal" />
      {children}
    </div>
  );
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-12 flex items-baseline gap-6 border-b border-border pb-4">
      <span className="font-mono text-xs text-muted-foreground">{n}</span>
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

/* ---------- sections ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.19_110_/_0.15),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>The identity membership</Eyebrow>
            <h1 className="mt-8 text-balance text-5xl font-bold leading-[0.92] md:text-7xl lg:text-[5.5rem]">
              Become someone
              <br />
              your past self
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-signal">won&apos;t recognize.</span>
                <span className="absolute -bottom-2 left-0 h-3 w-full bg-signal/20" />
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Sober. Clear. Disciplined. A new perspective — delivered the second you sign up.
              No crypto required. Partner program built in.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/join"
                className="group inline-flex items-center gap-3 bg-signal px-7 py-4 font-mono text-sm font-semibold uppercase tracking-widest text-signal-foreground shadow-brutal transition-all hover:translate-x-[-4px] hover:translate-y-[-4px]"
              >
                Unlock Day 1 now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 border border-border px-7 py-4 font-mono text-sm uppercase tracking-widest text-foreground transition-colors hover:bg-surface"
              >
                How it works
              </a>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                ["Instant", "Day 1 kit"],
                ["6", "Life tracks"],
                ["30%", "Partner cut"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-2xl font-bold text-signal">{v}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-signal/10 blur-3xl" />
            <div className="relative overflow-hidden border border-border bg-surface">
              <img
                src={heroImg}
                alt="Glowing wireframe blocks being assembled into a structure"
                width={1536}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">
                  <div>// LIVE</div>
                  <div className="text-signal">build.session.0241</div>
                </div>
                <div className="flex items-center gap-2 border border-signal/40 bg-background/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-signal backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                  on-chain
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "AI",
    "GAMIFICATION",
    "COMMUNITY",
    "BLOCKCHAIN",
    "ACHIEVEMENTS",
    "PROOF OF PROGRESS",
  ];
  const full = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border bg-surface py-5">
      <div className="marquee flex whitespace-nowrap">
        {full.map((t, i) => (
          <div key={i} className="flex items-center gap-8 px-8 font-display text-2xl font-bold">
            {t}
            <Hexagon className="h-3 w-3 fill-signal text-signal" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryTeaser() {
  return (
    <section className="border-b border-border bg-surface py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow>The road</Eyebrow>
          <h2 className="mt-6 text-3xl font-bold md:text-4xl">
            Nothing worked — until I picked one thing and stuck to it.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Courses, apps, Monday resets, motivation highs that faded by lunch. The turn wasn&apos;t
            more information. It was one track, daily proof, and people walking the same road.
          </p>
          <Link
            to="/story"
            className="group mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-signal hover:underline"
          >
            Read the full story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="border border-border bg-background p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Dark → bright
          </p>
          <p className="mt-4 font-display text-xl font-medium leading-snug">
            &ldquo;I kept restarting my life without ever finishing a chapter.&rdquo;
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Then: one ritual. One honest check-in. Proof that stacked until I couldn&apos;t deny who
            I was becoming — and a community that helps each other stay on the road.
          </p>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-5xl px-6">
        <SectionLabel n="02 / 14" title="The Problem" />
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-end">
          <div>
            <Eyebrow>The trap</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              Information is everywhere.
              <br />
              <span className="text-muted-foreground">Transformation is rare.</span>
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Most people watch courses. Read books. Save threads. Bookmark videos. Subscribe to
              newsletters they'll never open.
            </p>
            <p className="text-2xl font-medium leading-snug text-foreground">
              But they never take action — and{" "}
              <span className="bg-signal px-1.5 text-signal-foreground">
                knowledge without action changes nothing.
              </span>
            </p>
            <div className="grid grid-cols-3 gap-px border border-border bg-border">
              {[
                ["89%", "Never finish"],
                ["3%", "Build something"],
                ["0", "Get paid"],
              ].map(([v, l]) => (
                <div key={l} className="bg-background p-5">
                  <div className="font-display text-3xl font-bold text-destructive">{v}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const items = [
    { icon: Brain, label: "Learn" },
    { icon: Hammer, label: "Practice" },
    { icon: Coins, label: "Earn" },
    { icon: Rocket, label: "Build" },
    { icon: Users, label: "Connect" },
  ];
  return (
    <section className="relative border-y border-border bg-surface py-28 md:py-40">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionLabel n="03 / 14" title="The Solution" />
        <div className="max-w-3xl">
          <Eyebrow>Introducing</Eyebrow>
          <h2 className="mt-6 text-5xl font-bold md:text-6xl">
            Building Culture Academy.
            <br />
            <span className="text-signal">One platform. Five verbs.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            A platform where every move you make becomes proof. Where learning, practicing, earning,
            building, and connecting all happen in the same loop.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-5">
          {items.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="group relative flex flex-col gap-6 bg-background p-8 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-signal" strokeWidth={1.5} />
                <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
              </div>
              <div className="font-display text-3xl font-bold">{label}.</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Loop() {
  const steps = [
    "Learn",
    "Complete Challenge",
    "Earn XP",
    "Unlock Rewards",
    "Join Community",
    "Build Portfolio",
    "Increase Reputation",
    "Unlock Opportunities",
  ];
  return (
    <section id="how" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="04 / 14" title="The Building Loop" />
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
          <div className="md:sticky md:top-28">
            <Eyebrow>The engine</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">A loop that compounds.</h2>
            <p className="mt-6 text-muted-foreground">
              Every action feeds the next. Every cycle raises your floor. The longer you stay in,
              the harder it is to lose.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 border border-signal/40 bg-signal/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-signal">
              <InfinityIcon className="h-4 w-4" /> Repeat. Forever.
            </div>
          </div>

          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={s}
                className="group flex items-center gap-6 border border-border bg-surface p-5 transition-all hover:border-signal hover:bg-surface-elevated"
              >
                <span className="font-mono text-2xl font-bold text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-display text-xl font-semibold md:text-2xl">{s}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-signal" />
              </li>
            ))}
            <li className="flex items-center justify-center gap-3 border border-dashed border-signal/40 bg-signal/5 p-5 font-mono text-xs uppercase tracking-widest text-signal">
              <InfinityIcon className="h-4 w-4" /> loop back to 01
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function AIMentor() {
  const caps = [
    "Personalized roadmap",
    "Daily challenges",
    "Habit tracking",
    "Goal setting",
    "Project recommendations",
    "Career guidance",
    "Accountability partner",
  ];
  return (
    <section className="relative border-y border-border bg-surface py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="05 / 14" title="AI Mentor" />
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow>Always on. Always you.</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              An AI that <span className="text-signal">knows your goals</span> better than you do.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Not a chatbot. A mentor with memory — that watches your progress, adapts your roadmap,
              and shows up every morning with the one thing you should do today.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {caps.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-3 border border-border bg-background px-4 py-3"
                >
                  <Check className="h-4 w-4 text-signal" />
                  <span className="text-sm">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="border border-border bg-background p-6 font-mono text-sm shadow-brutal">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-signal" />
                  <span className="font-semibold">MENTOR.AI</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  06:42 · day 41
                </span>
              </div>
              <div className="mt-5 space-y-4">
                <div className="text-muted-foreground">{">"} Good morning, Alex.</div>
                <div className="text-foreground">
                  You shipped 2/3 tasks yesterday. Streak: <span className="text-signal">41🔥</span>
                </div>
                <div className="border-l-2 border-signal pl-4 text-foreground">
                  Today's mission: publish your first smart contract on testnet.
                  <br />
                  <span className="text-muted-foreground">
                    Est. 35 min · +120 XP · unlocks Web3 Tier 2
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="bg-signal px-4 py-2 text-xs font-semibold uppercase tracking-widest text-signal-foreground">
                    Accept
                  </button>
                  <button className="border border-border px-4 py-2 text-xs uppercase tracking-widest">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 -z-10 h-full w-full border border-signal/40" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Gamification() {
  const features = [
    { icon: Zap, t: "XP System", d: "Every action earns measurable progress." },
    { icon: Trophy, t: "Levels", d: "Climb tiers that unlock real perks." },
    { icon: Flame, t: "Streaks", d: "Compound consistency, daily." },
    { icon: Target, t: "Daily Missions", d: "Small wins. Massive momentum." },
    { icon: Rocket, t: "Weekly Quests", d: "Bigger arcs. Bigger payoffs." },
    { icon: Users, t: "Leaderboards", d: "Climb with friends and rivals." },
    { icon: Hexagon, t: "Achievement NFTs", d: "Own your accomplishments." },
    { icon: ShieldCheck, t: "Builder Score", d: "One number. Verified forever." },
  ];
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="06 / 14" title="Gamification" />
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Every action creates progress</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">Make momentum visible.</h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            We borrowed the best mechanics from games and put them on top of real-life skills,
            habits, and outcomes.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="group bg-background p-6 transition-colors hover:bg-surface-elevated"
            >
              <Icon className="h-7 w-7 text-signal" strokeWidth={1.5} />
              <div className="mt-6 font-display text-xl font-bold">{t}</div>
              <div className="mt-2 text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Paths() {
  return (
    <section id="tracks" className="relative border-y border-border bg-surface py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="07 / 14" title="Life Tracks" />
        <div className="mb-12 max-w-3xl">
          <Eyebrow>Pick your reset · start today</Eyebrow>
          <h2 className="mt-6 text-5xl font-bold md:text-6xl">
            Six tracks. One promise: <span className="text-signal">a new you.</span>
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((p) => {
            const PIcon = p.icon;
            return (
              <Link
                key={p.slug}
                to="/join"
                search={{ track: p.slug }}
                className="group relative flex min-h-[260px] flex-col justify-between bg-background p-8 transition-all hover:bg-surface-elevated"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-muted-foreground">TRACK / {p.n}</span>
                  <PIcon className="h-5 w-5 text-signal" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display text-3xl font-bold md:text-4xl">{p.title}</h3>
                  <p className="mt-3 text-muted-foreground">{p.tagline}</p>
                  <div className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-signal">
                    Start this track{" "}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-signal transition-transform group-hover:scale-x-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LiveCalls() {
  const calls = [
    {
      day: "Tuesday",
      time: "18:00 UTC",
      name: "Teaching Call",
      d: "90 min · mentor teaches the week's concept and builds in public.",
    },
    {
      day: "Thursday",
      time: "16:00 UTC",
      name: "Co-Building Lab",
      d: "2h · cohort work session, hot seats, accountability.",
    },
  ];
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="07.5 / 14" title="Live Calls" />
        <div className="mb-12 grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-end">
          <div>
            <Eyebrow>2 per week · every path</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              Show up live.
              <br />
              <span className="text-signal">Or grab the replay.</span>
            </h2>
          </div>
          <p className="text-muted-foreground">
            Two structured sessions every week, per path. One to teach, one to build together. Every
            call is recorded and added to your vault within 24h.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
          {calls.map((c) => (
            <div key={c.name} className="bg-surface p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-signal" />
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {c.day} · {c.time}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 border border-signal/40 bg-signal/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-signal">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> live
                </span>
              </div>
              <div className="mt-6 font-display text-3xl font-bold md:text-4xl">{c.name}</div>
              <p className="mt-3 text-muted-foreground">{c.d}</p>
              <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest">
                <span className="inline-flex items-center gap-1 border border-border px-2 py-1 text-muted-foreground">
                  <Video className="h-3 w-3" /> Replay
                </span>
                <span className="inline-flex items-center gap-1 border border-border px-2 py-1 text-muted-foreground">
                  <Download className="h-3 w-3" /> Downloadable
                </span>
                <span className="inline-flex items-center gap-1 border border-border px-2 py-1 text-muted-foreground">
                  <Users className="h-3 w-3" /> Cohort + mentor
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Vault() {
  const items = [
    { icon: FileText, v: "240+", l: "Curated links" },
    { icon: Download, v: "120+", l: "Templates &amp; repos" },
    { icon: Video, v: "Weekly", l: "Call replays" },
    { icon: Music, v: "24", l: "Frequency tracks" },
  ];
  return (
    <section className="relative border-y border-border bg-surface py-28 md:py-36">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionLabel n="07.6 / 14" title="Cloud Vault" />
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <Eyebrow>Everything in one place</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              Your private library.
              <br />
              <span className="text-signal">Downloadable from the cloud.</span>
            </h2>
            <p className="mt-6 max-w-xl text-muted-foreground">
              Every link, template, replay, and audio track — curated per path, gated to members,
              streamed or downloaded on demand. Yours for life.
            </p>
          </div>
          <div className="border border-border bg-background p-6 shadow-brutal">
            <div className="flex items-center justify-between border-b border-border pb-3 font-mono text-[10px] uppercase tracking-widest">
              <span className="text-muted-foreground">// vault.bcc.cloud</span>
              <span className="text-signal">connected</span>
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>~/paths/ai-builder/templates/agent-starter.zip</span>
                <span className="text-signal">12.4mb</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>~/paths/founder/replays/2026-06-10.mp4</span>
                <span className="text-signal">412mb</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>~/audio/focus-40hz-60min.mp3</span>
                <span className="text-signal">82mb</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>↓ downloading...</span>
                <span className="text-signal">98%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: I, v, l }) => (
            <div key={l} className="bg-background p-6">
              <I className="h-6 w-6 text-signal" strokeWidth={1.5} />
              <div
                className="mt-5 font-display text-3xl font-bold"
                dangerouslySetInnerHTML={{ __html: v }}
              />
              <div
                className="mt-1 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: l }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Frequency() {
  const tracks = [
    {
      name: "Focus",
      hz: "40 Hz · Gamma",
      use: "Deep work, coding, writing",
      color: "from-signal/30",
    },
    {
      name: "Flow",
      hz: "10 Hz · Alpha",
      use: "Creative building, design",
      color: "from-accent/30",
    },
    {
      name: "Recovery",
      hz: "6 Hz · Theta",
      use: "Post-session reset, journaling",
      color: "from-signal/20",
    },
    {
      name: "Sleep",
      hz: "2 Hz · Delta",
      use: "Wind-down and integration",
      color: "from-accent/20",
    },
  ];
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="07.7 / 14" title="Frequency Packs" />
        <div className="mb-14 grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-end">
          <div>
            <Eyebrow>Audio tuned to the work</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              Soundtracks
              <br />
              for <span className="text-signal">building.</span>
            </h2>
          </div>
          <p className="text-muted-foreground">
            Four binaural tracks per path — engineered for the specific cognitive state of the
            session. Stream from the dashboard or download for offline focus.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t) => (
            <div key={t.name} className={`relative overflow-hidden bg-surface p-6`}>
              <div
                className={`absolute inset-0 bg-gradient-to-b ${t.color} to-transparent opacity-60`}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <Waves className="h-6 w-6 text-signal" strokeWidth={1.5} />
                  <button
                    type="button"
                    aria-label={`Preview ${t.name}`}
                    className="flex h-10 w-10 items-center justify-center bg-signal text-signal-foreground transition-transform hover:scale-110"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="mt-6 font-display text-2xl font-bold">{t.name}</div>
                <div className="mt-1 font-mono text-xs text-signal">{t.hz}</div>
                <p className="mt-3 text-sm text-muted-foreground">{t.use}</p>
                <div className="mt-6 flex items-end gap-0.5 h-8">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-signal/60"
                      style={{
                        height: `${20 + Math.abs(Math.sin(i * 0.6)) * 80}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>60 min</span>
                  <span className="inline-flex items-center gap-1 text-signal">
                    <Download className="h-3 w-3" /> .mp3
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  const items = [
    { t: "On-chain achievements", d: "Immutable. Portable. Yours." },
    { t: "Verifiable certificates", d: "Public proof, not PDFs." },
    { t: "Reputation score", d: "One trusted number across the network." },
    { t: "Skill badges", d: "Granular, verifiable competence." },
    { t: "Builder profile", d: "A living resume that updates itself." },
  ];
  return (
    <section id="proof" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="08 / 14" title="Proof of Progress" />
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Receipts, not promises</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              Your progress is <span className="text-signal">verifiable</span> — by employers,
              partners, and the network itself.
            </h2>
            <p className="mt-6 text-muted-foreground">
              No more screenshots. No more "trust me bro." Every win is signed, timestamped, and
              owned by you.
            </p>
          </div>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.t} className="flex items-start gap-5 border border-border bg-surface p-5">
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-signal" />
                <div>
                  <div className="font-display text-xl font-semibold">{i.t}</div>
                  <div className="text-sm text-muted-foreground">{i.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Community() {
  const items = [
    "Builder groups",
    "Challenges",
    "Accountability circles",
    "Local chapters",
    "Global community",
  ];
  return (
    <section className="relative border-y border-border bg-surface py-28 md:py-40">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionLabel n="09 / 14" title="Community" />
        <div className="max-w-3xl">
          <Eyebrow>Together &gt; alone</Eyebrow>
          <h2 className="mt-6 text-5xl font-bold md:text-6xl">
            Success grows faster <span className="text-signal">together.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Solo discipline is finite. Collective momentum compounds. You're matched with the people
            who pull you forward.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          {items.map((i, idx) => (
            <div
              key={i}
              className="flex items-center gap-3 border border-border bg-background px-5 py-3"
            >
              <span className="font-mono text-xs text-signal">0{idx + 1}</span>
              <span className="font-display text-lg font-semibold">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rewards() {
  const items = [
    "30% direct commission",
    "10% level-two override",
    "5% level-three override",
    "Copy-paste invite scripts",
    "Real-time partner dashboard",
    "Monthly payout ready",
  ];
  return (
    <section id="partner" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="10 / 14" title="Rewards" />
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <Eyebrow>Food on the table</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              Share the reset.
              <br />
              <span className="text-signal">Earn on three levels.</span>
            </h2>
          </div>
          <p className="text-muted-foreground">
            Built for web2 partners — no wallet, no crypto talk. Introduce members, earn when they
            join monthly or lifetime. Your link unlocks on signup.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-background p-6 transition-colors hover:bg-surface-elevated"
            >
              <span className="font-display text-xl font-semibold">{i}</span>
              <Coins className="h-5 w-5 text-signal" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    {
      q: "I'd watched 200 hours of courses and built nothing. 60 days into BCA I shipped my first SaaS and signed 3 paying users.",
      n: "Maya R.",
      r: "Founder Builder · Lisbon",
    },
    {
      q: "The mentor + streaks combo is unfair. I haven't missed a day of writing or coding in 4 months. My LinkedIn looks like a different person's.",
      n: "Daniel K.",
      r: "AI Builder · Berlin",
    },
    {
      q: "Got hired through my builder profile — they didn't ask for a resume. They just verified my on-chain badges.",
      n: "Priya S.",
      r: "Web3 Builder · Bangalore",
    },
  ];
  return (
    <section className="relative border-y border-border bg-surface py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="11 / 14" title="Builders Shipping" />
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl text-5xl font-bold md:text-6xl">
            Real builders.
            <br />
            <span className="text-signal">Real outputs.</span>
          </h2>
          <div className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-signal text-signal" />
            ))}
            <span className="ml-2">4.9 / 5 · 1,847 reviews</span>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
          {t.map((x) => (
            <figure key={x.n} className="flex flex-col justify-between bg-background p-8">
              <blockquote className="font-display text-lg leading-snug md:text-xl">
                "{x.q}"
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-5">
                <div className="font-semibold">{x.n}</div>
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {x.r}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offer() {
  const includes = [
    "Instant Day 1 kit (60 sec)",
    "Identity declaration worksheet",
    "Morning & evening rituals",
    "Track-specific protocols",
    "Member library (grows weekly)",
    "Partner referral dashboard",
    "3-level commission plan",
    "50%+ fee locked as BCC — community staking",
    "Cancel anytime (monthly)",
  ];
  return (
    <section id="offer" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-6">
        <SectionLabel n="12 / 14" title="Membership" />
        <div className="mb-16 max-w-3xl">
          <Eyebrow>Delivered immediately</Eyebrow>
          <h2 className="mt-6 text-5xl font-bold md:text-6xl">
            Sign up. <span className="text-signal">Start becoming</span> someone new today.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-[1.1fr_1fr_1fr]">
          {/* Includes */}
          <div className="bg-background p-8">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Includes
            </div>
            <ul className="mt-6 space-y-3">
              {includes.map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-signal" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-baseline gap-3 border-t border-border pt-6">
              <span className="font-mono text-sm text-muted-foreground line-through">$997+</span>
              <span className="font-mono text-xs uppercase tracking-widest text-signal">
                Real value
              </span>
            </div>
          </div>

          {/* Monthly */}
          <div className="relative bg-background p-8">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Monthly
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-6xl font-bold">$19</span>
              <span className="font-mono text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Cancel anytime. Keep your library forever.
            </p>
            <Link
              to="/join"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 border border-border px-6 py-4 font-mono text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-surface"
            >
              Start Monthly <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Lifetime */}
          <div className="relative bg-signal p-8 text-signal-foreground">
            <div className="absolute right-4 top-4 bg-signal-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-signal">
              Best value
            </div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-70">
              Lifetime Pass
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-6xl font-bold">$199</span>
              <span className="font-mono text-sm opacity-70">once</span>
            </div>
            <p className="mt-3 text-sm opacity-80">
              Forever access · higher partner rates · priority new tracks.
            </p>
            <Link
              to="/join"
              search={{ track: "sober-reset" }}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-signal-foreground px-6 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-signal transition-transform hover:translate-y-[-2px]"
            >
              Claim Lifetime <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Urgency() {
  const perks = [
    "Founder NFT (1 of 500)",
    "Lifetime Founder badge",
    "2x reward multipliers",
    "Governance access",
  ];
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-24">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionLabel n="13 / 14" title="Early Builder Program" />
        <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow>Founding round · 500 spots</Eyebrow>
            <h2 className="mt-6 text-5xl font-bold md:text-6xl">
              The first 500 builders <span className="text-signal">write the rules.</span>
            </h2>
            <p className="mt-6 max-w-xl text-muted-foreground">
              Founding members are minted into the protocol forever. After spots fill, the door
              closes — and pricing doubles.
            </p>
          </div>
          <div className="border border-signal/40 bg-background p-8 shadow-brutal">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Spots remaining
              </span>
              <span className="font-display text-3xl font-bold text-signal">137 / 500</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden bg-border">
              <div className="h-full w-[73%] bg-signal" />
            </div>
            <ul className="mt-6 space-y-3">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-signal" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-32 md:py-44">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.92_0.19_110_/_0.18),transparent_60%)]" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Eyebrow>14 / 14 — Your move</Eyebrow>
        <h2 className="mx-auto mt-8 text-balance text-5xl font-bold leading-[0.95] md:text-7xl lg:text-8xl">
          The world doesn't need
          <br />
          more consumers.
          <br />
          <span className="text-signal">It needs more builders.</span>
        </h2>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/join"
            className="group inline-flex items-center gap-3 bg-signal px-10 py-5 font-mono text-sm font-semibold uppercase tracking-widest text-signal-foreground shadow-brutal transition-all hover:translate-x-[-4px] hover:translate-y-[-4px]"
          >
            Start your reset
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-px border border-border bg-border">
          {[
            ["Build", "Yourself"],
            ["Build", "Community"],
            ["Build", "The Future"],
          ].map(([a, b]) => (
            <div key={b} className="bg-background p-6">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {a}
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-signal">{b}.</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-2">
          <Hexagon className="h-4 w-4 fill-signal text-signal" />
          RESET © 2026
        </div>
        <div>New identity. New discipline. New life.</div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <Hero />
      <Marquee />
      <StoryTeaser />
      <Problem />
      <Solution />
      <Loop />
      <AIMentor />
      <Gamification />
      <Paths />
      <LiveCalls />
      <Vault />
      <Frequency />
      <Proof />
      <Community />
      <Rewards />
      <Testimonials />
      <Offer />
      <Urgency />
      <FinalCTA />
      <Footer />
    </main>
  );
}
