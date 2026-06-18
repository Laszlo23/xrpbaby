import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Download,
  FileText,
  Hexagon,
  Music,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Video,
  Waves,
} from "lucide-react";
import { getPath, PATHS, type PathData } from "@/lib/paths-data";

export const Route = createFileRoute("/paths/$slug")({
  loader: ({ params }) => {
    const path = getPath(params.slug);
    if (!path) throw notFound();
    return { path };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.path;
    if (!p) return { meta: [{ title: "Path not found — Building Culture" }] };
    return {
      meta: [
        { title: `${p.title} Path — Building Culture Academy` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.title} Path — Building Culture Academy` },
        { property: "og:description", content: p.description },
      ],
    };
  },
  component: PathPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">Path not found</h1>
        <Link to="/" className="mt-4 inline-block text-signal">
          ← Back home
        </Link>
      </div>
    </div>
  ),
});

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
    <div className="mb-10 flex items-baseline gap-6 border-b border-border pb-4">
      <span className="font-mono text-xs text-muted-foreground">{n}</span>
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

function PathPage() {
  const data = Route.useLoaderData() as { path: PathData };
  const p = data.path;
  const Icon = p.icon;

  const totalLinks = p.vault.links.reduce((a, b) => a + b.count, 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-bold">
            <Hexagon className="h-5 w-5 fill-signal text-signal" strokeWidth={1.5} />
            BUILDING&nbsp;CULTURE
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.19_110_/_0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            to="/"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-signal"
          >
            ← all paths
          </Link>
          <div className="mt-6 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                PATH / {p.n}
              </div>
              <h1 className="mt-4 text-balance text-5xl font-bold leading-[0.95] md:text-7xl">
                {p.title}.
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-muted-foreground">{p.tagline}</p>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">
                {p.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/app/profile"
                  search={{ path: p.slug }}
                  className="group inline-flex items-center gap-3 bg-signal px-7 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground shadow-brutal transition-all hover:translate-x-[-4px] hover:translate-y-[-4px]"
                >
                  Enroll in this path <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#vault"
                  className="inline-flex items-center gap-2 border border-border px-7 py-4 font-mono text-xs uppercase tracking-widest hover:bg-surface"
                >
                  Preview the vault
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="border border-border bg-surface p-8 shadow-brutal">
                <Icon className="h-12 w-12 text-signal" strokeWidth={1.5} />
                <div className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Capstone
                </div>
                <p className="mt-2 font-display text-xl font-semibold leading-tight">
                  {p.capstone}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
                  <Stat v="12" l="Weeks" />
                  <Stat v="2/wk" l="Live calls" />
                  <Stat v={String(totalLinks)} l="Resources" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel n="01 / 05" title="Outcomes" />
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
            <div>
              <Eyebrow>By week 12 you will have</Eyebrow>
              <h2 className="mt-6 text-4xl font-bold md:text-5xl">
                Real, <span className="text-signal">verifiable</span> outputs.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
              {p.outcomes.map((o, i) => (
                <div key={o} className="flex items-start gap-4 bg-background p-5">
                  <span className="font-mono text-xs text-signal">0{i + 1}</span>
                  <span className="text-base">{o}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel n="02 / 05" title="12-Week Roadmap" />
          <div className="space-y-4">
            {p.phases.map((phase, i) => (
              <div
                key={phase.name}
                className="grid gap-6 border border-border bg-surface p-8 md:grid-cols-[auto_1fr_1.5fr_1.2fr] md:items-center"
              >
                <span className="font-mono text-3xl font-bold text-signal">0{i + 1}</span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {phase.weeks}
                  </div>
                  <div className="font-display text-2xl font-bold">{phase.name}</div>
                </div>
                <div className="text-muted-foreground">{phase.focus}</div>
                <div className="flex items-center gap-3 border-l border-border pl-6">
                  <Target className="h-5 w-5 text-signal" />
                  <span className="text-sm">{phase.deliverable}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live calls */}
      <section className="border-y border-border bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel n="03 / 05" title="Live Calls" />
          <div className="mb-12 grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-end">
            <div>
              <Eyebrow>2 per week · live + replays</Eyebrow>
              <h2 className="mt-6 text-4xl font-bold md:text-5xl">
                Show up live.
                <br />
                <span className="text-signal">Or download the replay.</span>
              </h2>
            </div>
            <p className="text-muted-foreground">
              Two structured sessions every week: one to teach, one to build together. Every call is
              recorded and added to your downloadable vault within 24h.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
            {p.liveCalls.map((c) => (
              <div key={c.name} className="bg-background p-8">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-signal" />
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {c.day}
                  </span>
                </div>
                <div className="mt-4 font-display text-3xl font-bold">{c.name}</div>
                <p className="mt-2 text-muted-foreground">{c.format}</p>
                <div className="mt-6 inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Video className="h-3 w-3" /> Replay downloadable
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vault */}
      <section id="vault" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel n="04 / 05" title="Cloud Vault" />
          <div className="mb-12 grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-end">
            <div>
              <Eyebrow>Everything downloadable</Eyebrow>
              <h2 className="mt-6 text-4xl font-bold md:text-5xl">
                Your <span className="text-signal">private library.</span>
              </h2>
            </div>
            <p className="text-muted-foreground">
              Curated links, ready-to-use templates, audio, and replays. Yours forever — stored in
              the cloud, downloadable on demand, gated to members.
            </p>
          </div>

          {/* Links */}
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {p.vault.links.map((l) => (
              <div key={l.label} className="bg-background p-6">
                <FileText className="h-5 w-5 text-signal" />
                <div className="mt-4 font-display text-3xl font-bold">{l.count}</div>
                <div className="mt-1 text-sm text-muted-foreground">{l.label}</div>
              </div>
            ))}
          </div>

          {/* Templates */}
          <div className="mt-8 border border-border bg-surface p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Templates &amp; starter packs
              </div>
              <Download className="h-4 w-4 text-signal" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {p.vault.templates.map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between border border-border bg-background px-4 py-3 text-sm"
                >
                  <span>{t}</span>
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Frequency pack */}
          <div className="mt-8 border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-signal" />
                <div>
                  <div className="font-display text-xl font-bold">Frequency Pack</div>
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    4 tracks · tuned for the {p.title} flow
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-signal md:inline-flex">
                <Music className="h-3 w-3" /> .mp3 · .wav
              </div>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {p.vault.audio.map((a) => (
                <div key={a.name} className="bg-background p-6">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg font-bold">{a.name}</div>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center bg-signal text-signal-foreground transition-transform hover:scale-110"
                      aria-label={`Preview ${a.name}`}
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                  <div className="mt-4 font-mono text-xs text-signal">{a.hz}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{a.use}</p>
                  <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{a.duration}</span>
                    <span className="inline-flex items-center gap-1 text-signal">
                      <Download className="h-3 w-3" /> Download
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enroll / proof */}
      <section id="enroll" className="border-t border-border bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel n="05 / 05" title="Enroll" />
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <Eyebrow>Same membership · all 6 paths</Eyebrow>
              <h2 className="mt-6 text-5xl font-bold md:text-6xl">
                One pass.
                <br />
                <span className="text-signal">Every path. Every vault.</span>
              </h2>
              <p className="mt-6 max-w-xl text-muted-foreground">
                Your Builder membership unlocks all 6 paths, every live call, every vault, and your
                AI mentor. Switch paths anytime — your XP and reputation carry across.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/app/profile"
                  search={{ path: p.slug }}
                  className="group inline-flex items-center gap-3 bg-signal px-7 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground shadow-brutal transition-all hover:translate-x-[-4px] hover:translate-y-[-4px]"
                >
                  Start this path <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 border border-border px-7 py-4 font-mono text-xs uppercase tracking-widest hover:bg-background"
                >
                  Back to overview
                </Link>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                { icon: Sparkles, t: "AI mentor tuned to this path" },
                { icon: Trophy, t: "On-chain capstone NFT" },
                { icon: ShieldCheck, t: "Verifiable skill badges" },
                { icon: Check, t: "Lifetime vault access" },
              ].map(({ icon: I, t }) => (
                <li
                  key={t}
                  className="flex items-center gap-4 border border-border bg-background p-5"
                >
                  <I className="h-5 w-5 text-signal" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Other paths */}
          <div className="mt-20">
            <div className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Explore other paths
            </div>
            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3 lg:grid-cols-5">
              {PATHS.filter((x) => x.slug !== p.slug).map((x) => {
                const XIcon = x.icon;
                return (
                  <Link
                    key={x.slug}
                    to="/paths/$slug"
                    params={{ slug: x.slug }}
                    className="group bg-background p-5 transition-colors hover:bg-surface"
                  >
                    <XIcon className="h-6 w-6 text-signal" strokeWidth={1.5} />
                    <div className="mt-4 font-display text-lg font-bold">{x.title}</div>
                    <div className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-signal">
                      Open <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <Hexagon className="h-4 w-4 fill-signal text-signal" />
            Building Culture Academy © 2026
          </div>
          <div>Don't just learn. Build.</div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-signal">{v}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {l}
      </div>
    </div>
  );
}
